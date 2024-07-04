import config from '#config';
import utils from '#bot/utils';

export default (wss, client) => client.on('messageCreate', async (msg) => {
    if ((msg.channelId !== config.server.bridgeChannel) || (msg.author.bot || msg.author.system)) return;

    let badges = [];
    let roles = await utils.getRoles(msg.author.id, client);
    config.badges.filter(s => s?.role).forEach((roleBadge) => roles.includes(roleBadge.role) && badges.push(roleBadge));

    wss.getWss().clients.forEach(async (client) => client.send(JSON.stringify({
        event: 'message',
        discord: true,
        content: msg.content,
        author: msg.author.username,
        authorId: msg.author.id,
        pfp: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.${msg.author.avatar.startsWith('a_') ? 'gif' : 'png'}`,
        badges
    })));
});