'use strict';

/**
 * Sets which HTTP verb to use when doing the request to the API.
 */

module.exports = {
	options: {
		'method': [ 'X', 'HTTP method to use.', 'STRING', 'GET' ],
	},
	init: function ( cli, args, options, api, callback ) {
		api.setMethod( options.method );
		return callback();
	},
};
