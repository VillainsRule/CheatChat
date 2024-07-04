import config from '#config';

export default {
    getRoles: async (id, client) => {
        try {
            let guild = client.guilds.cache.get(config.server.id) || await client.guilds.fetch(config.server.id);
            let member = guild.members.cache.get(id) || await guild.members.fetch(id);

            return [...member.roles.cache].filter((r) => r[1].rawPosition !== 0).map((r) => r[0]);
        } catch {
            return [];
        };
    }
};