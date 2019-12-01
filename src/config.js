const path = require('path');

const requireProcessEnv = (name) => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
}

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: process.env.PORT || 3000,
        ip: process.env.IP || '0.0.0.0',
    },
    production: {
        ip: process.env.IP || '0.0.0.0',
        port: process.env.PORT || 3000
    }
}

console.log('ENV:', config.all.env);

module.exports = Object.assign(config.all, config[config.all.env]);