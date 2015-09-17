'use strict';

var	commander = require( 'commander'        ),
	sequence  = require( './utils/sequence' ),
	log       = require( './utils/log'      ),
	modules   = require( './modules'        ),

	CLI_VERSION = '0.3.0';

/**
 * Creates a function to handle a command.
 *
 * @param cmd      The command object.
 * @param context  WP-API-CLI context object.
 * @param wpApi    WpApi object.
 * @param callback Called after command is handled.
 */
function handleCommand( cmd, context, wpApi, callback ) {
	return function () {
		var	cmdArgsLength = cmd.args ? cmd.args.length : 0,
			options       = arguments[ cmdArgsLength ], // The last argument is the options object.
			cmdArgs,
			i;

		cmdArgs = [];
		if ( cmd.args ) {
			for ( i = 0; i < cmdArgsLength; i += 1 ) {
				cmdArgs.push( arguments[ i ] );
			}
		}

		sequence( modules, 'init', [ context, wpApi, options ], function ( error ) {
			if ( error ) {
				return callback( 'Init Error: ' + error );
			}
			cmd.handler.apply( cmd, [ context, wpApi ].concat( cmdArgs ).concat( [ options, callback ] ) );
		});
	};
}

/**
 * Called after all modules have been loaded.
 *
 * @param argv     Process argument list.
 * @param context  WP-API-CLI context object.
 * @param callback Called after command is handled.
 */
function afterLoad( argv, context, wpApi, callback ) {
	var	program = new commander.Command();
	program.version( CLI_VERSION );

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
 *
 * @param argv     Process arguments.
 * @param context  WP-API-CLI context object.
 * @param wpApi    WP-API object.
 * @param callback Optional. Called after CLI is done processing.
 */
function main( argv, context, wpApi, callback ) {
	if ( typeof argv === 'string' ) {
		argv = argv.split( ' ' );
	}
	if ( argv[0].indexOf( 'node' ) < 0 ) {
		argv.unshift( 'node' );
	}

	/*
	 * Setup default callback if needed.
	 * It writes the result to stdout.
	 */
	if ( ! callback ) {
		callback = function ( error, result ) {
			if ( error ) {
				console.log( 'ERROR:', error );
			} else if ( result ) {
				if ( context.outputFilter ) {
					console.log( context.outputFilter( result ) );
				} else {
					if ( typeof result === 'string' ) {
						console.log( result );
					} else if ( typeof result.statusCode !== 'undefined' ) {
						log.response( result );
					} else {
						console.log( JSON.stringify( result, null, '  ' ) );
					}
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
