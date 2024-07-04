import express from 'express';
import session from 'express-session';
import expressWs from 'express-ws';
import sqlite3 from 'sqlite3';
import * as sqlite from 'sqlite';
import Discord from 'discord.js';
import fs from 'fs';
import url from 'url';
import config from '#config';

const app = express();

sqlite3.verbose();

(async () => {
    let db = await sqlite.open({
        filename: './db/data.sql',
        driver: sqlite3.Database
    });

    let wss = expressWs(app);

    app.use(express.json());
    app.set('trust proxy', 1);

    app.use(session({
        secret: config.session.secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 999999,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    }));

    app.use((req, res, next) => {
        req.realIP = req.session.ip = req.headers['cf-connecting-ip'] || req.ip;

        if (req.realIP.startsWith('34.') || req.realIP.startsWith('35.')) res.status(403).end('Get off replit. ヾ(*ФωФ)βyё βyё☆彡');
        else next();
    });

    app.use(async (req, res, next) => {
        let [ban] = await db.all('SELECT * FROM bans WHERE ip = ?', [req.realIP]);
        if (!ban) next();
        else res.send(`
            <title>ヾ(*ФωФ)βyё βyё☆彡</title>
            <style>* {background:black;color:white;font-size:1.3em;font-family:monospace;}</style>
            <div style="width:100%;height:100%;position:absolute;top:0;left:0;display:flex;justify-content:center;align-items:center;text-align:center;">
                you've been banned. probably forever. ヾ(*ФωФ)βyё βyё☆彡
            </div>
        `);
    });

    const client = new Discord.Client({
        intents: Object.values(Discord.GatewayIntentBits).filter(s => typeof s === 'number')
    });

    client.on('ready', () => client.user.setPresence({
        status: 'dnd',
        activities: [{
            name: 'with StateFarm',
            type: Discord.ActivityType.Playing
        }]
    }));

    client.login(config.discord.token);

    await Promise.all(fs.readdirSync('./src/api').map(async (file) => (await import(`./api/${file}`)).default(app, db, client)));

    await Promise.all(fs.readdirSync('./src/bot').map(async (file) =>
        (typeof (await import(`./bot/${file}`))?.default === 'function' ?
            (await import(`./bot/${file}`))?.default(wss, client) : null)));

    (await import('./ws/main.js')).default(app, wss, db, client);

    app.use(express.static(url.fileURLToPath(new URL('.', import.meta.url)) + '../public'));

    app.listen(config.port, () => console.log(`listening on ${config.port}`));
})();