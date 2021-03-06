const choices = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
const BaseHelper = require('./BaseHelper');

class RandomHelper extends BaseHelper {
    constructor(client) {
        super(client);
    }

    generateToken(length) {
        if (!length) length = 7;
        let output = '';
        for (let i = 0; i < length; i++) {
            output += choices[this.getRandomInt(0, choices.length - 1)];
        }
        return output;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = RandomHelper;