/**
 * Blargbot and stuff
 * made by stupid cat and stuff
 * yeah
 */

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Promise Rejection:', reason || p);
});
process.env.SHARD_ID = -1;

global.Promise = require('bluebird');
global._config = require('./config.json');

const core = require('./Core');

global._logger = new core.Logger();
//_config.avatars = require(_config.general.isbeta ? './Data/avatarsBeta.json' : './Data/avatars.json');

process.env['SHARD_ID'] = -1;

const client = new core.Client();

client.init();
