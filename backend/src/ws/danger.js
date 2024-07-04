export default async (msg, wss, session) => {
    if (!session.badges.some((badge) => ['1ust'].includes(badge.name))) return;

    wss.getWss().clients.forEach((client) => client.send(JSON.stringify({
        event: 'dangerElement',
        element: msg.element
    })));
};