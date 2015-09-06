'use strict';

var	nodeunit = require( 'nodeunit' ),
	reporter = nodeunit.reporters[ 'default' ];

process.chdir( __dirname );
reporter.run([
	'test-auth.js',
	'test-update.js',
	'test-features.js',
	'test-standard-endpoints.js',
]);
