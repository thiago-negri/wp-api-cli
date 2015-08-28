'use strict';

var cliInsecure;

function init( cli, args, options, api, callback ) {
	/* Allow connections to SSL sites without certs */
	if ( options.insecure ) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}
	callback();
}

cliInsecure = {
	init: init,
	options: {
		/* Support HTTPS with self signed certificate. */
		insecure: [ 'k', 'Allow connections to SSL sites without certs' ],
	},
};

module.exports = cliInsecure;
