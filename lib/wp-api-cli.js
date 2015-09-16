'use strict';

var	commander = require( 'commander'        ),
	sequence  = require( './utils/sequence' ),
	log       = require( './utils/log'      ),
	WpApi     = require( './wp-api'         ),
	modules   = require( './modules'        );

function handleCommand( cmd, context, wpApi, callback ) {
	return function () {
		var	optionsLength = cmd.args ? cmd.args.length : 0,
			options = arguments[ optionsLength ],
			fullArgs = [],
			i;

		if ( cmd.args ) {
			for ( i = 0; i < optionsLength; i += 1 ) {
				fullArgs.push( arguments[ i ] );
			}
		}

		sequence( modules, 'init', [ context, wpApi, options ], function ( error ) {
			if ( error ) {
				return callback( 'Init Error: ' + error );
			}
			cmd.handler.apply( cmd, [ context, wpApi ].concat( fullArgs ).concat( [ options, callback ] ) );
		});
	};
}

/**
 * Called after all modules have been loaded.
 */
function afterLoad( argv, context, wpApi, callback ) {
	var	program = new commander.Command();
	program.version( '0.3.0' );

	/* Load options and commands from modules. */
	modules.forEach( function ( mod ) {
		var	key,
			cmd,
			cliCmd,
			option,
			optionStr,
			commandStr;

		if ( mod.options ) {
			for ( key in mod.options ) {
				if ( mod.options.hasOwnProperty( key ) ) {
					option = mod.options[ key ];

					optionStr = '';

					if ( option.alias ) {
						optionStr += '-' + option.alias + ', ';
					}

					optionStr += '--' + key;

					if ( option.type === 'STRING' ) {
						optionStr += ' <string>';
					} else if ( option.type === 'FILE' ) {
						optionStr += ' <file>';
					}

					program.option( optionStr, option.label );
				}
			}
		}

		if ( mod.commands ) {
			for ( key in mod.commands ) {
				if ( mod.commands.hasOwnProperty( key ) ) {
					cmd = mod.commands[ key ];

					commandStr = key;
					if ( cmd.args ) {
						cmd.args.forEach( function ( arg ) {
							commandStr += ' <' + arg + '>';
						});
					}

					cliCmd = program.command( commandStr );
					cliCmd.description( cmd.label );

					if ( cmd.options ) {
						for ( key in cmd.options ) {
							if ( cmd.options.hasOwnProperty( key ) ) {
								option = cmd.options[ key ];

								optionStr = '';

								if ( option.alias ) {
									optionStr += '-' + option.alias + ', ';
								}

								optionStr += '--' + key;

								if ( option.type ) {
									optionStr += ' <value>';
								}

								cliCmd.option( optionStr, option.label );
							}
						}
					}

					cliCmd.action( handleCommand( cmd, context, wpApi, callback ) );
				}
			}
		}
	});

	program.parse( argv );
}

/**
 * CLI entry point.
 */
function main( argv, context, wpApi, callback ) {
	if ( typeof argv === 'string' ) {
		argv = argv.split( ' ' );
	}
	if ( argv[0].indexOf( 'node' ) < 0 ) {
		argv.unshift( 'node' );
	}

	if ( ! callback ) {
		callback = function ( error, result ) {
			var	key;
			if ( error ) {
				console.log( 'ERROR:', error );
			} else if ( result ) {
				if ( typeof result === 'string' ) {
					console.log( result );
				} else if ( typeof result.statusCode !== 'undefined' ) {
					log.response( result );
				} else {
					console.log( JSON.stringify( result, null, '  ' ) );
				}
			}
		};
	}
	sequence( modules, 'load', [ context, wpApi ], function ( error ) {
		if ( error ) {
			return callback( 'Load Error: ' + error );
		}
		afterLoad( argv, context, wpApi, callback );
	});
}

module.exports.main = main;
