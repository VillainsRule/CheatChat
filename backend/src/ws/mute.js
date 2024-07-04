import config from '#config';

export default async (msg, ws, wss, db, session) => {
    if (!msg.length || isNaN(msg.length) || !msg.id) return;
    if (!session.badges.some((badge) => ['based user', 'deveggloper', '1ust'].includes(badge.name))) return;
    if (![...wss.getWss().clients].find(c => c.userId === msg.id)) return;

    let endTime = Date.now() + msg.length;
    let mutedClient = [...wss.getWss().clients].find(c => c.userId === msg.id);

    mutedClient.send(JSON.stringify({
        event: 'mute',
        endTime: endTime
    }));

    db.run(`UPDATE accounts SET mute = ? WHERE id = ?`, [endTime, msg.id]);

    ws.send(JSON.stringify({
        event: 'message',
        content: `Muted ${mutedClient.userName} until ${new Date(endTime).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'America/New_York'
        })}.`,
        author: 'System',
        authorId: '0',
        pfp: 'https://i.imgur.com/ZNLOgct.png',
        badges: [ config.badges.find((b) => b.name === 'bot') ]
    }))
};