#!/usr/bin/env node

var	cli      = require( 'cli'                 ),
	WpApi    = require( './lib/wp-api'        ),
	cliAuth  = require( './lib/modules/auth'  ),
	cliPosts = require( './lib/modules/posts' ),
	cliPages = require( './lib/modules/pages' ),
	cliMedia = require( './lib/modules/media' ),

	options  = buildOptions(),
	commands = buildCommands();

function buildOptions() {
	var	key,
		options = {
			site:  [ 's', '(Required) Set base URL to use', 'STRING' ],
			debug: [ 'd', 'Turns on debugging mode, will output interactions with server' ],

			/* Support HTTPS with self signed certificate. */
			insecure: [ 'k', 'Allow connections to SSL sites without certs' ],
		};

	/* Load all options from Auth module. */
	for ( key in cliAuth.options ) {
		if ( cliAuth.options.hasOwnProperty( key ) ) {
			options[ key ] = cliAuth.options[ key ];
		}
	}

	/* Load all options from Posts module. */
	for ( key in cliPosts.options ) {
		if ( cliPosts.options.hasOwnProperty( key ) ) {
			options[ key ] = cliPosts.options[ key ];
		}
	}

	/* Load all options from Pages module. */
	for ( key in cliPages.options ) {
		if ( cliPages.options.hasOwnProperty( key ) ) {
			options[ key ] = cliPages.options[ key ];
		}
	}

	/* Load all options from Media module. */
	for ( key in cliMedia.options ) {
		if ( cliMedia.options.hasOwnProperty( key ) ) {
			options[ key ] = cliMedia.options[ key ];
		}
	}

	return options;
}

function buildCommands() {
	var commands = {};

	/* Load all commands from OAuth module. */
	for ( key in cliAuth.commands ) {
		if ( cliAuth.commands.hasOwnProperty( key ) ) {
			commands[ key ] = cliAuth.commands[ key ].label;
		}
	}

	/* Load all commands from Posts module. */
	for ( key in cliPosts.commands ) {
		if ( cliPosts.commands.hasOwnProperty( key ) ) {
			commands[ key ] = cliPosts.commands[ key ].label;
		}
	}

	/* Load all commands from Pages module. */
	for ( key in cliPages.commands ) {
		if ( cliPages.commands.hasOwnProperty( key ) ) {
			commands[ key ] = cliPages.commands[ key ].label;
		}
	}

	/* Load all commands from Media module. */
	for ( key in cliMedia.commands ) {
		if ( cliMedia.commands.hasOwnProperty( key ) ) {
			commands[ key ] = cliMedia.commands[ key ].label;
		}
	}

	return commands;
}

cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );

cli.option_width = 38;

cli.parse( options, commands );

cli.main( function ( args, options ) {
	var	config,
		wpApi;

	validateAndSanitize( options );

	/* Allow connections to SSL sites without certs */
	if ( options.insecure ) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	config = {
		site:  options.site,
		debug: options.debug,
	};
	wpApi = new WpApi( config );

	/* Initialize Auth module */
	cliAuth.init( cli, args, options, wpApi, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		processCommand( args, options, wpApi );
	});
});

/**
 * Validate and sanitize user input.
 */
function validateAndSanitize( options ) {
	if ( ! options.site ) {
		cli.fatal( 'Missing base URL. Please, set a base URL by using `-s` or `--site`.' );
	}
	if ( options.site[-1] !== '/' ) {
		options.site = options.site + '/';
	}
}

function processCommand( args, options, wpApi ) {
	var key;

	/* Handle Auth module commands */
	for ( key in cliAuth.commands ) {
		if ( cliAuth.commands.hasOwnProperty( key ) ) {
			if ( cli.command === key ) {
				cliAuth.commands[ key ].handler( cli, args, options, wpApi );
				return;
			}
		}
	}

	/* Handle Posts module commands */
	for ( key in cliPosts.commands ) {
		if ( cliPosts.commands.hasOwnProperty( key ) ) {
			if ( cli.command === key ) {
				cliPosts.commands[ key ].handler( cli, args, options, wpApi );
				return;
			}
		}
	}

	/* Handle Pages module commands */
	for ( key in cliPages.commands ) {
		if ( cliPages.commands.hasOwnProperty( key ) ) {
			if ( cli.command === key ) {
				cliPages.commands[ key ].handler( cli, args, options, wpApi );
				return;
			}
		}
	}

	/* Handle Media module commands */
	for ( key in cliMedia.commands ) {
		if ( cliMedia.commands.hasOwnProperty( key ) ) {
			if ( cli.command === key ) {
				cliMedia.commands[ key ].handler( cli, args, options, wpApi );
				return;
			}
		}
	}
}
