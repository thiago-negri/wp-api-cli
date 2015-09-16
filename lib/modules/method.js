'use strict';

/**
 * Sets which HTTP verb to use when doing the request to the API.
 */

module.exports = {
	options: {
		'method': {
			alias: 'X',
			label: 'HTTP method to use.',
			type : 'STRING',
		},
	},
	init: function ( context, api, options, callback ) {
		if ( options.parent.method ) {
			api.setMethod( options.parent.method );
		}
		return callback();
	},
};
