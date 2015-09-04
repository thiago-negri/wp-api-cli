'use strict';

var	nodeunit = require( 'nodeunit' ),
	reporter = nodeunit.reporters[ 'default' ];

process.chdir( __dirname );
reporter.run( [ 'test-standard-endpoints.js' ] );
