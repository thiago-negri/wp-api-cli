'use strict';

var	nodeunit = require( 'nodeunit' ),
	reporter = nodeunit.reporters[ 'default' ];

process.chdir( __dirname );
reporter.run([
	'test-update.js',
	'test-features.js',
	'test-standard-endpoints.js',
]);
