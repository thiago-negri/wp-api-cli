'use strict';

/**
 * Exports option '--debug' and '-d' to set debug mode.
 */
module.exports = {
	init: function ( cli, args, options, api, callback ) {
		if ( options.debug ) {
			api.setDebug( true );
		}
		callback();
	},
	options: {
		debug: {
			alias: 'd',
			label: 'Turns on debugging mode, will output interactions with server'
		},
	},
};
