'use strict';

/**
 * Exports option '--site' and '-s' to set the URL of the site to connect to.
 */
module.exports = {
	init: function ( context, api, options, callback ) {
		if ( options.parent.site ) {
			api.setSite( options.parent.site );
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
