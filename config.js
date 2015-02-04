var log = require('winston')
  , Loggly = require('winston-loggly').Loggly
  , localProviders = require('nitrogen-local-providers');

var config = {};

if (process.env.NODE_ENV === "production") {
    config = {
        mongodb_connection_string: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost/nitrogen"
    };
} else if (process.env.NODE_ENV === "test") {
    config = {
        mongodb_connection_string: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost/nitrogen_test"
    };
} else {
    config = {
        mongodb_connection_string: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost/nitrogen_dev"
    };
}

config.request_log_format = ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent"';

// You can use Loggly's log service by specifying these 4 environmental variables
if (process.env.LOGGLY_SUBDOMAIN && process.env.LOGGLY_INPUT_TOKEN &&
    process.env.LOGGLY_USERNAME && process.env.LOGGLY_PASSWORD) {

    log.add(Loggly, {
        "subdomain": process.env.LOGGLY_SUBDOMAIN,
        "inputToken": process.env.LOGGLY_INPUT_TOKEN,
        "auth": {
            "username": process.env.LOGGLY_USERNAME,
            "password": process.env.LOGGLY_PASSWORD
        }
    });
}

log.remove(log.transports.Console);
log.add(log.transports.Console, { colorize: true, timestamp: true, level: 'info' });

module.exports = config;