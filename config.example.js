let config = {
    port: 22222,

    discord: {
        id: '',
        token: '',
        secret: ''
    },

    session: {
        secret: 'cheatchat'
    },

    server: {
        id: '',

        bridgeChannel: '',

        roles: {
            lust: '',
            deveggloper: '',
            chad: ''
        }
    },

    host: {
        url: '',
        secure: true
    },

    moderation: {
        maximumConnections: 20,
        chatCooldown: 750
    },

    webhookLink: ''
};

config.badges = [
    {
        name: '1ust',
        icon: '/img/skull.png',
        role: config.server.roles.lust,
        emoji: '<:skull:1224169782434201640>'
    },
    {
        name: 'deveggloper',
        icon: 'https://cdn3.emoji.gg/emojis/7937-developer-bage.png',
        role: config.server.roles.deveggloper,
        emoji: '<:dev:1224169781213663233>'
    },
    {
        name: 'based user',
        icon: 'https://cdn3.emoji.gg/emojis/5178-gigachad.png',
        role: config.server.roles.chad,
        emoji: '<:chad:1224169780555157637>'  
    },
    {
        name: 'bot',
        icon: 'https://cdn3.emoji.gg/emojis/5378-nerd.png',
        emoji: '<:nerd:1224169779137347605>'
    }
];

export default config;