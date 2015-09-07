'use strict';

/**
 * Module 'insecure' definition.
 *
 * Allow connections to SSL sites without certs.
 * Support HTTPS with self signed certificate.
 */
module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = ( options.insecure ? '0' : '1' );
		return callback();
	},
	options: {
		insecure: {
			alias: 'k',
			label: 'Allow connections to SSL sites without certs',
		},
	},
};
