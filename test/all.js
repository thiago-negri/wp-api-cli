'use strict';

var	nodeunit = require( 'nodeunit' ),
	reporter = nodeunit.reporters[ 'default' ];

/**
 * Disable logging.
 */
require( '../lib/utils/log' ).enabled = false;

process.chdir( __dirname );
reporter.run([
	'test-auth.js',
	'test-update.js',
	'test-features.js',
	'test-standard-endpoints.js',
]);
