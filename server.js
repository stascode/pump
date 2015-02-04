var config = require('./config')
  , core = require('nitrogen-core');

core.config = require('./config');
core.log = require('winston');


if (process.env.LOGGLY_SUBDOMAIN && process.env.LOGGLY_INPUT_TOKEN &&
    process.env.LOGGLY_USERNAME && process.env.LOGGLY_PASSWORD) {

    core.log.add(Loggly, {
        "subdomain": process.env.LOGGLY_SUBDOMAIN,
        "inputToken": process.env.LOGGLY_INPUT_TOKEN,
        "auth": {
            "username": process.env.LOGGLY_USERNAME,
            "password": process.env.LOGGLY_PASSWORD
        }
    });
}

core.log.remove(core.log.transports.Console);
core.log.add(core.log.transports.Console, { colorize: true, timestamp: true, level: 'info' });

core.log.info("connecting to mongodb instance: " + core.config.mongodb_connection_string);
mongoose.connect(core.config.mongodb_connection_string);

// only open endpoints when we have a connection to MongoDB.
mongoose.connection.once('open', function () {
    core.log.info("service connected to mongodb.");

    console.log('initialize start');
    core.services.initialize(function(err) {
        console.log('initialize finished: ' + err);
        if (err) return core.log.error("service failed to initialize: " + err);
        if (!core.services.principals.servicePrincipal) return core.log.error("Service principal not available after initialize.");
        core.log.info("pump service has initialized itself, exposing api externally at: " + core.config.api_endpoint + " and internally on: " + core.config.internal_port);

        while(true) {

			// fetch messages from MessagingHub
			var messages;

			// push these into Nitrogen via core
			core.services.messages.createMany(core.services.principals.servicePrincipal, messages, function(err, messages) {
				// handle failure by not ACKing messages pulled from EventHub
				// handle success by ACKing messages pulled from EventHub
			});
        }
	});
});