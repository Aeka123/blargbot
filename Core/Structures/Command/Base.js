class BaseCommand {
    constructor(client, options = {}) {
        if (this.constructor === BaseCommand) {
            throw new Error("Can't instantiate an abstract class!");
        }
        this.client = client;
        this.hidden = options.hidden || false;
        this.name = options.name || this.constructor.name;
        this.flags = options.flags || [];
        this.aliases = options.aliases || [];
        this.minArgs = options.minArgs || 0;
        /**
         * Subcommands are objects with the following structure
         * this.subcommands = {
         *   // A name used for usage and locale generation
         *   name: {
         *     flags, // An array, optional
         *     minArgs // the minimum amount of args the user must provide
         *   }
         * }
         * Locales populated are:
         * `${base}.subcommand.${name}.usage`
         * `${base}.subcommand.${name}.info`
         */
        this.subcommands = options.subcommands || {};
        this.subcommandAliases = options.subcommandAliases || {};
    }

    async getInfo(dest) {
        return await this.decode(dest, `${this.base}.info`);
    }

    async getUsage(dest) {
        return await this.decode(dest, `${this.base}.usage`);
    }

    async webInfo() {
        let paragraphs = (await this.getInfo()).replace(/\n+/g, '\n')
            .replace(/>/g, '&gt;').replace(/</g, '&lt;').split('\n');
        let output = '';
        let list = [];
        for (const line of paragraphs) {
            if (line.startsWith(' - ')) {
                list.push(`<li>${line.substring(3)}</li>`);
            } else {
                if (list.length > 0) {
                    output += `<ul>${list.join('')}</ul>`;
                    list = [];
                }
                output += `<p>${line}</p>`;
            }
        }
        output.replace(/```\n((?:.|\n)+?)\n```/gim, '<pre><code>$1</code></pre>')
            .replace(/`((?:.|\n)+?)`/gim, '<code>$1</code>');
        return output;
    }

    async execute(ctx) { }

    async _execute(ctx) {
        ctx.words.shift();
        let key = (ctx.words[0] || '').toLowerCase();
        if (this.subcommandAliases.hasOwnProperty(key)) key = this.subcommandAliases[key];
        if (this.subcommands.hasOwnProperty(key)) {
            if (typeof this[`sub_${key}`] == 'function') {
                ctx.words.shift();
                this.parseInput(ctx, key);
                let minArgs = this.subcommands[key].minArgs || 0;
                if (ctx.input._.length < minArgs)
                    return await this.notEnoughParameters(ctx, minArgs, ctx.input._.length);
                return await this[`sub_${key}`](ctx);
            }
            else throw new Error('No matching function found for subcommand ' + key);
        } else {
            this.parseInput(ctx);
            if (ctx.input._.length < this.minArgs)
                return await this.notEnoughParameters(ctx, this.minArgs, ctx.input._.length);
            return await this.execute(ctx);
        }
    }

    async event(params) {

    }

    async send(dest, content, file) {
        await this.client.Helpers.Message.send(dest, content, file);
    }

    async decode(dest, key, args) {
        await this.client.Helpers.Message.decode(dest, key, args);
    }

    async canExecute(ctx) {
        return true;
    }

    async notEnoughParameters(ctx, expected, received) {
        return await ctx.decodeAndSend('error.notenoughparams', {
            name: this.name,
            prefix: 'b!', // TODO: Prefix stuff
            expected, received
        });
    }

    async genericError(ctx, message) {
        return await ctx.send(await ctx.decode('error.generic', {
            message
        }));
    }

    parseInput(ctx, subcommand) {
        let flags = this.flags;
        if (subcommand !== undefined && this.subcommands[subcommand] !== undefined
            && Array.isArray(this.subcommands[subcommand].flags)) {
            for (const flag of this.subcommands[subcommand].flags) {
                flags.push(flag);
            }
        }

        let words = ctx.words;
        let output = {
            _: []
        };
        output._.raw = [];
        let currentFlag = '';
        for (let i = 0; i < words.length; i++) {
            let pushFlag = true;
            if (words[i].startsWith('--')) {
                let parseFlags = flags.filter(f => f.word == words[i].substring(2).toLowerCase());
                if (parseFlags.length > 0) {
                    currentFlag = parseFlags[0].flag;
                    output[currentFlag] = [];
                    pushFlag = false;
                }
            } else if (words[i].startsWith('-')) {
                let tempFlag = words[i].substring(1);
                let parseFlags = flags.map(f => f.flag);
                let oldFlag = currentFlag, oldOutput = output;
                pushFlag = false;
                for (const char of tempFlag) {
                    if (parseFlags.includes(char)) {
                        currentFlag = char;
                        output[currentFlag] = [];
                    } else {
                        output = oldOutput;
                        currentFlag = oldFlag;
                        pushFlag = true;
                        break;
                    }
                }
            }
            if (pushFlag) {
                if (currentFlag != '') {
                    output[currentFlag].push(words[i]);
                    if (!output[currentFlag].raw) output[currentFlag].raw = [];
                    output[currentFlag].raw.push(words.rawArgs[i]);
                } else {
                    if (words[i] != '') {
                        output['_'].push(words[i]);
                        output['_'].raw.push(words.rawArgs[i]);
                    }
                }
            }
        }
        ctx.input = output;
    };

    get base() {
        return `command.${this.category}.${this.name}`;
    }
}

module.exports = BaseCommand;