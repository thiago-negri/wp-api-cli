'use strict';

/**
 * Exports option '--site' and '-s' to set the URL of the site to connect to.
 */
module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
		if ( options.site ) {
			api.setSite( options.site );
		}
		return callback();
	},
	options: {
		site: {
			alias: 's',
			label: 'Set base URL to use',
			type : 'STRING',
		},
	},
};
