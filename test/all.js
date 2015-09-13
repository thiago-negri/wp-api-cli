'use strict';

var	nodeunit = require( 'nodeunit' ),
	reporter = nodeunit.reporters[ 'default' ],

	testFiles = [
		'test-auth.js',
		'test-update.js',
		'test-features.js',
		'test-standard-endpoints.js',
	];

/**
 * Disable logging.
 */
require( '../lib/utils/log' ).enabled = false;

process.chdir( __dirname );
reporter.run( testFiles, null, function ( error ) {
	if ( error ) {
		process.exit( 1 );
	}
});
