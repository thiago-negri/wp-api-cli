var	cli     = require( 'cli'       ),
	WpApi   = require( './wp-api'  ),
	modules = require( './modules' );

/**
 * Sequences the initialization of all modules.
 *
 * Halts if any module fails to initialize.
 */
function sequenceModules( methodName, args, callback ) {
	var	go = function ( i ) {
			if ( i >= modules.length ) { /* Done initializing all modules, fire the final callback. */
				callback();
			} else { /* Still have modules to initialize. */
				if ( modules[ i ][ methodName ] ) { /* The current module supports initialization? */
					/* Initialize the module, the callback will handle errors and advance our module-initialization-index. */
					modules[ i ][ methodName ].apply( modules[ i ], args.concat( function ( error ) {
						if ( error ) {
							return cli.fatal( error );
						}
						/* Module sucessfuly initialized, go to next module to initialize. */
						go( i + 1 );
					}));
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
	modules.forEach( function ( mod ) {
		var	key;
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
	});
}

function main() {
	var	wpApi = new WpApi();

	sequenceModules( 'load', [ wpApi ], function ( error ) {
		var	options  = {},
			commands = {};

		if ( error ) {
			console.log( 'Load Error: ' + error );
			return;
		}

		/* Load options and commands from modules. */
		modules.forEach( function ( mod ) {
			var key;
			if ( mod.options ) {
				for ( key in mod.options ) {
					if ( mod.options.hasOwnProperty( key ) ) {
						options[ key ] = mod.options[ key ];
					}
				}
			}
			if ( mod.commands ) {
				for ( key in mod.commands ) {
					if ( mod.commands.hasOwnProperty( key ) ) {
						commands[ key ] = mod.commands[ key ].label;
					}
				}
			}
		});

		cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );
		cli.option_width = 38;
		cli.parse( options, commands );

		cli.main( function ( args, options ) {
			sequenceModules( 'init', [ cli, args, options, wpApi ], function () {
				processCommand( args, options, wpApi );
			});
		});
	});
}

module.exports.main = main;
