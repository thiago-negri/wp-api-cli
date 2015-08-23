#!/usr/bin/env node

var	cli      = require( 'cli'                 ),
	WpApi    = require( './lib/wp-api'        ),
	cliAuth  = require( './lib/modules/auth'  ),
	cliPosts = require( './lib/modules/posts' ),
	cliPages = require( './lib/modules/pages' ),
	cliMedia = require( './lib/modules/media' ),

	modules  = loadModules(),
	options  = buildOptions(),
	commands = buildCommands();

function loadModules() {
	var	modules;
	modules = [
		cliAuth,
		cliPosts,
		cliPages,
		cliMedia,
	];
	return modules;
}

function buildOptions() {
	var	options = {
			site:  [ 's', '(Required) Set base URL to use', 'STRING' ],
			debug: [ 'd', 'Turns on debugging mode, will output interactions with server' ],

			/* Support HTTPS with self signed certificate. */
			insecure: [ 'k', 'Allow connections to SSL sites without certs' ],
		};

	/* Load options from modules. */
	modules.forEach( function ( mod ) {
		var key;
		for ( key in mod.options ) {
			if ( mod.options.hasOwnProperty( key ) ) {
				options[ key ] = mod.options[ key ];
			}
		}
	});

	return options;
}

function buildCommands() {
	var	commands = {};

	/* Load commands from modules. */
	modules.forEach( function ( mod ) {
		var key;
		for ( key in mod.commands ) {
			if ( mod.commands.hasOwnProperty( key ) ) {
				commands[ key ] = mod.commands[ key ].label;
			}
		}
	});

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

	initModules( cli, args, options, wpApi, function () {
		processCommand( args, options, wpApi );
	});
});

/**
 * Sequences the initialization of all modules.
 *
 * Halts if any module fails to initialize.
 */
function initModules( cli, args, options, api, callback ) {
	var	go = function ( i ) {
			return function ( cli, args, options, api, cb ) {
				if ( i >= modules.length ) { /* Done initializing all modules, fire the final callback. */
					cb();
				} else { /* Still have modules to initialize. */
					if ( modules[i].init ) { /* The current module supports initialization? */
						/* Initialize the module, the callback will handle errors and advance our module-initialization-index. */
						modules[i].init( cli, args, options, api, function ( error ) {
							if ( error ) {
								cli.fatal( error );
							}
							/* Module sucessfuly initialized, go to next module to initialize. */
							go( i + 1 )( cli, args, options, api, callback );
						});
					} else {
						/* The module does not need to be initialized, go to next module to initialize. */
						go( i + 1 )( cli, args, options, api, callback );
					}
				}
			};
		};
	/* Start module initialization from the very first one. */
	go( 0 )( cli, args, options, api, callback );
}

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
	var	i, arr, len, mod, key;
	for (i = 0, arr = modules, len = arr.length; i < len; i += 1) {
		mod = arr[i];
		for ( key in mod.commands ) {
			if ( mod.commands.hasOwnProperty( key ) ) {
				if ( cli.command === key ) {
					mod.commands[ key ].handler( cli, args, options, wpApi );
					return;
				}
			}
		}
	}
}
