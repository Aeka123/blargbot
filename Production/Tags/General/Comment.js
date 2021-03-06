const { General } = require('../../../Core/Structures/Tag');

class CommentTag extends General {
    constructor(client) {
        super(client, {
            name: '//',
            args: [
                {
                    name: 'text',
                    optional: true,
                    repeat: true
                }
            ]
        });
    }

    async execute(ctx, args) {
        return await super.execute(ctx, args, false);
    }
}

module.exports = CommentTag;