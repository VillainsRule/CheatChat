import axios from 'axios';
import config from '#config';
import utils from '#bot/utils';

let cooldowns = {};

export default async (msg, ws, wss, db, session, client) => {
    let badges = [];

    if (!session.isGuest) {
        let roles = await utils.getRoles(session.discordUser.id, client);
        config.badges.filter(s => s?.role).forEach((roleBadge) => roles.includes(roleBadge.role) && badges.push(roleBadge));
    };

    if (cooldowns[session.ip] > Date.now()) return ws.send(JSON.stringify({ event: 'error', error: 'You are being rate limited.' }));
    cooldowns[session.ip] = Date.now() + config.moderation.chatCooldown;

    let [ user ] = await db.all(`SELECT * FROM accounts WHERE id = ?`, [session.userID]);
    if (!user) return ws.send(JSON.stringify({ event: 'logout' }));

    if (!!user.mute) return ws.send(JSON.stringify({ event: 'mute', endTime: user.mute }));

    if (!(!!msg.content) || typeof msg.content !== 'string' || msg.content.trim().length < 1 || msg.content.length > 100) return;

    wss.getWss().clients.forEach((client) => client.send(JSON.stringify({
        event: 'message',
        content: msg.content,
        author: session.name,
        authorId: session.userID,
        pfp: session.isGuest ? 'default' : session.pfp,
        badges
    })));

    await db.run(`INSERT INTO logs VALUES (?, ?, ?, ?)`, [
        session.userID,
        session.name,
        session.ip,
        msg.content
    ]);

    await axios.post(config.webhookLink, {
        content: `${session.badges.length ? `[ ${session.badges.map((badge) => badge.emoji)} ]` : ''} **${session.name}** > > ${msg.content}`
    });
};