const Spawner = require('./Spawner');
const EventEmitter = require('eventemitter3');
const Eris = require('eris');

class Client {
    constructor() {
        this.Emitter = new EventEmitter();
        //this.discord = new DiscordClient();
        this.spawner = new Spawner({
            max: _config.discord.shards
        });
        //this.irc = new IrcClient();
        this.Helpers = require('./Helpers');

        // A discord client that *doesn't* connect to the gateway
        this.discord = new Eris(_config.discord.token, {
            restMode: true
        });
    }

    async init() {
        await this.spawner.spawnAll();
        _logger.init('All shards have spawned. Connecting...');
        await this.spawner.awaitBroadcast('connect');
        _logger.init('Shards connected');
    }
}

module.exports = Client;