const Base = require('./Base');

class CatCommand extends Base {
    constructor(...args) {
        super(...args);
        if (this.constructor === CatCommand) {
            throw new Error("Can't instantiate an abstract class!");
        }
        this.category = 'cat';
    }

    async getInfo() {
        return 'meow meow meow';
    }

    async getUsage() {
        return 'meow meow meow';
    }

    async canExecute(ctx) {
        return ctx.msg.author.id == this.client.Constants.CAT_ID;
    }
}

module.exports = CatCommand;