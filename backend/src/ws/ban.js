import config from '#config';

export default async (msg, ws, wss, db, session) => {
    if (!msg.id) return;
    if (!session.badges.some((badge) => ['based user', 'deveggloper', '1ust'].includes(badge.name))) return;
    if (![...wss.getWss().clients].find(c => c.userId === msg.id)) return;

    let bannedClient = [...wss.getWss().clients].find(c => c.userId === msg.id);

    await db.run('INSERT INTO bans VALUES (?, ?)', [
        bannedClient.ip,
        session.ip
    ]);

    await db.run('UPDATE accounts SET ban = ? WHERE id = ?', [
        session.ip,
        msg.id
    ]);

    ws.send(JSON.stringify({
        event: 'message',
        content: `Banned ${bannedClient.userName}'s & their IP, ${bannedClient.ip}.`,
        author: 'System',
        authorId: '0',
        pfp: 'https://i.imgur.com/ZNLOgct.png',
        badges: [ config.badges.find((b) => b.name === 'bot') ]
    }));

    bannedClient.send(JSON.stringify({
        event: 'reload'
    }));

    bannedClient.close();
};