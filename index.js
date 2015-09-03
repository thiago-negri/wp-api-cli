#!/usr/bin/env node

'use strict';

var	cli   = require( './lib/wp-api-cli' ),
	WpApi = require( './lib/wp-api'     ),

	context = {
		oauthFile: __dirname + '/lib/modules/oauth.json',
		apiDescriptionFile: __dirname + '/lib/modules/api.json',
	};

cli.main( process.argv, context, new WpApi() );
