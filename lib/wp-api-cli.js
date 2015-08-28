var	cli     = require( 'cli'       ),
	WpApi   = require( './wp-api'  ),
	modules = require( './modules' ),

	options,
	commands;

function buildOptions() {
	var	options = {};

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
							return cli.fatal( error );
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

function main() {
	var	wpApi = new WpApi();

	cliRoutes.load( wpApi, function ( error ) {
		if ( error ) {
			console.log( 'Load Error: ' + error );
			return;
		}

		options  = buildOptions();
		commands = buildCommands();

		cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );
		cli.option_width = 38;
		cli.parse( options, commands );

		cli.main( function ( args, options ) {
			initModules( cli, args, options, wpApi, function () {
				processCommand( args, options, wpApi );
			});
		});
	});
}

module.exports.main = main;
