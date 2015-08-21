#!/usr/bin/env node

/* FIXME Change 'context' to an object (prototype). */

var cli     = require( 'cli'        ),
	request = require( 'request'    ),
	oauth   = require( 'oauth-lite' );

cli.setUsage( 'wp-api-cli [OPTIONS]' );

cli.parse({
	url:   [ 'u',   '(Required) Set base URL to use',                                'STRING' ],
	user:  [ false, 'Set username to use for HTTP Basic Authentication',             'STRING' ],
	pass:  [ false, 'Set password to use for HTTP Basic Authentication',             'STRING' ],
	debug: [ 'd',   'Turns on debugging mode, will output interactions with server' ]
});

cli.main( function ( args, options ) {
	var context = {
			args: args,
			options: options,
			request: request.defaults( { json: true } )
		};
	step0_validateAndSanitize( context );
	step1_discover( context );
});

/**
 * Validate and sanitize user input.
 */
function step0_validateAndSanitize( context ) {
	if ( ! context.options.url ) {
		cli.fatal( 'Missing base URL. Please, set a base URL by using `-u` or `--url`.' );
	}

	if ( ! context.options.user || ! context.options.pass ) {
		cli.fatal( 'Please, set a username (`--user`) and password (`--pass`) to use for HTTP Basic Authentication.' );
	}

	if ( context.options.url[-1] !== '/' ) {
		context.options.url = context.options.url + '/';
	}
}

/**
 * Discovers WP-API base URL from WordPress server.
 *
 * See http://v2.wp-api.org/guide/discovery/
 */	
function step1_discover( context ) {
	if ( context.options.debug ) {
		console.log( '> HEAD ' + context.options.url );
	}

	context.request.head( context.options.url , function ( error, response, body ) {
		if ( error || response.statusCode !== 200 ) {
			cli.fatal( 'Error when trying to discover WP-API: ' + response.statusCode + ' ' + error );
		}

		/* FIXME Check how the `response.headers` is constructed when the server returns more than a single 'Link' header. */
		if ( ! response.headers.link ) {
			cli.fatal( 'Could not find WP-API on the server. Please, make sure it is activated.' );
		}

		/* FIXME Using regular expression to extract the base URL, there sould be a better way to do this. */
		context.wpApiUrl = response.headers.link.match(/.*<([^>]*)>; rel="https:\/\/github.com\/WP-API\/WP-API"/)[1];

		step2_describe( context );
	});
}

function step2_describe( context ) {
	if ( context.options.debug ) {
		console.log( '> GET ' + context.wpApiUrl );
	}

	context.request.get( context.wpApiUrl , function ( error, response, body ) {
		if ( error || response.statusCode !== 200 ) {
			cli.fatal( 'Error when trying to describe WP-API: ' + response.statusCode + ' ' + error );
		}

		context.wpApi = body;

		step3_authenticate( context );
	});
}

function step3_authenticate( context ) {
	/*
	 * FIXME Could not use OAuth1, server keeps returning 401.
	 * FIXME Need to activate SSL on Apache (WAMP).
	 */

	/*	
	var url = context.wpApi.authentication.oauth1.request,
		config = {
			oauth_consumer_key: 'JtnNmhOeI3bS',
			oauth_consumer_secret: 'hYEPcpwMWEInOrKiNNZIKg4h81jDmW21v0p8vTfdYf0qEmje',
			oauth_callback: 'localhost'
		},
		form = null;

	oauth.fetchRequestToken( config, url, form, function ( error, params ) {
		if ( error ) {
			cli.fatal( 'Error when trying to authenticate: ' + error );
		}

		context.oauth = {
			token: params.oauth_token,
			tokenSecret: params.oauth_token_secret
		};

		console.log( context.oauth );
	});
	*/

	context.authenticatedRequest = context.request.defaults({
		auth: {
			user: context.options.user,
			pass: context.options.pass,
			sendImmediately: false
		}
	});

	step4_handleCommand( context );
}

function step4_handleCommand( context ) {
	var command;

	context.collection = context.args[0];
	context.action = context.args[1];

	command = context.collection + ' ' + context.action;

	if ( command === 'post list' ) {
		step5_listPosts( context );
	}
}

function step5_listPosts( context ) {
	var url = context.wpApiUrl + 'wp/v2/posts';

	if ( context.options.debug ) {
		console.log( '> GET ' + url + ' (with credentials)');
	}

	context.authenticatedRequest.get( url, function ( error, response, body ) {
		console.log( body );
	});
}
