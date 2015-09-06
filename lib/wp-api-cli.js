'use strict';

var	cli      = require( 'cli'              ),
	sequence = require( './utils/sequence' ),
	WpApi    = require( './wp-api'         ),
	modules  = require( './modules'        );

function processCommand( context, args, options, wpApi, callback ) {
	modules.forEach( function ( mod ) {
		var	key;
		if ( mod.commands ) {
			for ( key in mod.commands ) {
				if ( mod.commands.hasOwnProperty( key ) ) {
					if ( cli.command === key ) {
						mod.commands[ key ].handler( context, cli, args, options, wpApi, callback );
						return;
					}
				}
			}
		}
	});
}

function afterLoad( argv, context, wpApi, callback ) {
	var	options  = {},
		commands = {};

	/* Load options and commands from modules. */
	modules.forEach( function ( mod ) {
		var	key,
			option;

		if ( mod.options ) {
			for ( key in mod.options ) {
				if ( mod.options.hasOwnProperty( key ) ) {
					option = mod.options[ key ];

					options[ key ] = [
						option.alias,
						option.label,
						option.type ? option.type : 'BOOLEAN',
						option.defaultValue
					];
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

	cli.setApp( 'wp-api-cli' );
	cli.setArgv( argv );
	cli.option_width = 38;
	cli.parse( options, commands );

	cli.main( function ( args, options ) {
		sequence( modules, 'init', [ context, cli, args, options, wpApi ], function ( error ) {
			if ( error ) {
				return callback( 'Init Error: ' + error );
			}
			processCommand( context, args, options, wpApi, callback );
		});
	});
}

function main( argv, context, wpApi, callback ) {
	if ( ! callback ) {
		callback = function ( error, result ) {
			if ( error ) {
				cli.error( error );
			} else if ( result ) {
				if ( typeof result === 'string' ) {
					cli.ok( result );
				} else {
					cli.ok( JSON.stringify( result, null, '  ' ) );
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
