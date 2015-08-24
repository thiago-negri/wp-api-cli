#!/usr/bin/env node

var	cli           = require( 'cli'                      ),
	WpApi         = require( './lib/wp-api'             ),
	cliInsecure   = require( './lib/modules/insecure'   ),
	cliForce      = require( './lib/modules/force'      ),
	cliAuth       = require( './lib/modules/auth'       ),
	cliPosts      = require( './lib/modules/posts'      ),
	cliPages      = require( './lib/modules/pages'      ),
	cliMedia      = require( './lib/modules/media'      ),
	cliComments   = require( './lib/modules/comments'   ),
	cliTaxonomies = require( './lib/modules/taxonomies' ),

	modules       = loadModules(),
	options       = buildOptions(),
	commands      = buildCommands();

function loadModules() {
	var	modules;
	modules = [
		cliInsecure,
		cliForce,
		cliAuth,
		cliPosts,
		cliPages,
		cliMedia,
		cliComments,
		cliTaxonomies,
	];
	return modules;
}

function buildOptions() {
	var	options = {
			site:  [ 's', '(Required) Set base URL to use', 'STRING' ],
			debug: [ 'd', 'Turns on debugging mode, will output interactions with server' ],
		};

	/* Load options from modules. */
	modules.forEach( function ( mod ) {
		var key;
		if ( mod.options ) {
			for ( key in mod.options ) {
				if ( mod.options.hasOwnProperty( key ) ) {
					options[ key ] = mod.options[ key ];
				}
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
		if ( mod.commands ) {
			for ( key in mod.commands ) {
				if ( mod.commands.hasOwnProperty( key ) ) {
					commands[ key ] = mod.commands[ key ].label;
				}
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
			if ( i >= modules.length ) { /* Done initializing all modules, fire the final callback. */
				callback();
			} else { /* Still have modules to initialize. */
				if ( modules[i].init ) { /* The current module supports initialization? */
					/* Initialize the module, the callback will handle errors and advance our module-initialization-index. */
					modules[i].init( cli, args, options, api, function ( error ) {
						if ( error ) {
							cli.fatal( error );
						}
						/* Module sucessfuly initialized, go to next module to initialize. */
						go( i + 1 );
					});
				} else {
					/* The module does not need to be initialized, go to next module to initialize. */
					go( i + 1 );
				}
			}
		};
	/* Start module initialization from the very first one. */
	go( 0 );
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
		if ( mod.commands ) {
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
}
