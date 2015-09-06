'use strict';

/**
 * Exports option '--debug' and '-d' to set debug mode.
 */
module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
		if ( options.debug ) {
			api.setDebug( true );
		}
		return callback();
	},
	options: {
		debug: {
			alias: 'd',
			label: 'Turns on debugging mode, will output interactions with server'
		},
	},
};
