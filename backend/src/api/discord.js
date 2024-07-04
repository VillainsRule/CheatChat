import axios from 'axios';
import crypto from 'crypto';
import config from '#config';
import utils from '#bot/utils';

const ratelimited = {};

export default (app, db, client) => {
    app.get('/api/discord/auth', async (req, res) => {
        res.redirect(`https://discord.com/oauth2/authorize?client_id=${config.discord.id}&response_type=code&redirect_uri=http${config.host.secure ? 's' : ''}%3A%2F%2F${encodeURIComponent(config.host.url)}%2Fapi%2Fdiscord%2Fcallback&scope=identify+guilds&prompt=none`);
    });

    app.get('/api/discord/callback', async (req, res) => {
        if (req.session.token && req.session.userID) return res.redirect('/');

        if (ratelimited[req.realIP]) return res.send({ success: false, error: 'You are being rate limited.' });
        ratelimited[req.realIP] = true;
        setTimeout(() => delete ratelimited[req.realIP], 10000);

        const tokenData = new URLSearchParams();

        tokenData.append('client_id', config.discord.id);
        tokenData.append('client_secret', config.discord.secret);
        tokenData.append('grant_type', 'authorization_code');
        tokenData.append('redirect_uri', `http${config.host.secure ? 's' : ''}://${config.host.url}/api/discord/callback`);
        tokenData.append('scope', 'identify');
        tokenData.append('code', req.query.code);

        let token = await axios.post('https://discord.com/api/oauth2/token', tokenData, {
            validateStatus: false
        });

        if (token.data?.error === 'invalid_grant') return res.redirect('/api/discord/auth');

        let user = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token.data.access_token}`
            }
        });

        let [ activeAccount ] = await db.all(`SELECT * FROM accounts WHERE name = ?`, [user.data.username]);
        if (activeAccount) {
            if (!!activeAccount.ban) {
                await db.run('INSERT INTO bans VALUES (?, ?)', [
                    req.session.ip,
                    activeAccount.ban
                ]);

                res.redirect(req.originalUrl);

                return;
            };

            req.session.token = activeAccount.token;
            req.session.userID = activeAccount.id;
            req.session.name = activeAccount.name;
            req.session.pfp = `https://cdn.discordapp.com/avatars/${user.data.id}/${user.data.avatar}.png`;
            req.session.discordToken = token.data.access_token;
            req.session.discordUser = user.data;
            req.session.isGuest = false;
            req.session.badges = [];

            let roles = await utils.getRoles(user.data.id, client);
            config.badges.filter(s => s?.role).forEach((roleBadge) => roles.includes(roleBadge.role) && req.session.badges.push(roleBadge));

            return res.send(`<script>opener.postMessage('discord');</script>`);
        };

        let accountId = crypto.randomUUID();
        let accountToken = crypto.createHash('sha256').update(crypto.randomBytes(20).toString('hex')).digest('hex');

        await db.run('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            accountId,
            user.data.username,
            req.realIP,
            accountToken,
            JSON.stringify(user.data),
            token.data.access_token,
            0,
            ''
        ]);

        req.session.token = accountToken;
        req.session.userID = accountId;
        req.session.name = user.data.username;
        req.session.pfp = `https://cdn.discordapp.com/avatars/${user.data.id}/${user.data.avatar}.${user.data.avatar.startsWith('a_') ? 'gif' : 'png'}`;
        req.session.discordToken = token.data.access_token;
        req.session.discordUser = user.data;
        req.session.isGuest = false;
        req.session.badges = [];

        let roles = await utils.getRoles(user.data.id, client);
        config.badges.filter(s => s?.role).forEach((roleBadge) => roles.includes(roleBadge.role) && req.session.badges.push(roleBadge));

        return res.send(`<script>opener.postMessage('discord');</script>`);
    });
};