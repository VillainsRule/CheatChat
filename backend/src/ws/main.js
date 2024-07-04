import config from '#config';

import message from '#ws/message';
import mute from '#ws/mute';
import ban from '#ws/ban';
import danger from '#ws/danger';

let ratelimits = {};

export default (app, wss, db, client) => app.ws('/ws', async (ws, req) => {
    if (!req.session.token) {
        ws.send(JSON.stringify({
            event: 'error',
            error: 'Unauthorized.'
        }));
        return ws.close();
    };

    ws.userId = req.session.userID;
    ws.userName = req.session.name;
    ws.ip = req.session.ip;

    if (ratelimits[req.realIP] > config.moderation.maximumConnections) {
        ws.send(JSON.stringify({
            type: 'error',
            error: 'Unauthorized.'
        }));
        ws.close();

        ratelimits[req.realIP]++;
        return setTimeout(() => ratelimits[req.realIP]--, 5000);
    } else ratelimits[req.realIP] ? ratelimits[req.realIP]++ : ratelimits[req.realIP] = 1;

    ws.on('message', async (msg) => {
        try {
            msg = JSON.parse(msg);
        } catch {
            ws.close();
        };

        switch (msg.type) {
            case 'message':
                await message(msg, ws, wss, db, req.session, client);
                break;
            case 'mute':
                await mute(msg, ws, wss, db, req.session);
                break;
            case 'ban':
                await ban(msg, ws, wss, db, req.session);
                break;
            case 'danger':
                await danger(msg, wss, req.session);
                break;
            default:
                console.log('Unknown type:', msg.type);
                break;
        };
    });
});