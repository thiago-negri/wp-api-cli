'use strict';

/**
 * Exports option '--site' and '-s' to set the URL of the site to connect to.
 */
module.exports = {
	init: function ( cli, args, options, api, callback ) {
		if ( options.site ) {
			api.setSite( options.site );
		}
		callback();
	},
	options: {
		site: [ 's', 'Set base URL to use', 'STRING' ]
	},
};
