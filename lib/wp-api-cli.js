'use strict';

var	cli      = require( 'cli'              ),
	sequence = require( './utils/sequence' ),
	WpApi    = require( './wp-api'         ),
	modules  = require( './modules'        );

function processCommand( context, args, options, wpApi ) {
	modules.forEach( function ( mod ) {
		var	key;
		if ( mod.commands ) {
			for ( key in mod.commands ) {
				if ( mod.commands.hasOwnProperty( key ) ) {
					if ( cli.command === key ) {
						mod.commands[ key ].handler( context, cli, args, options, wpApi );
						return;
					}
				}
			}
		}
	});
}

function afterLoad( argv, context, wpApi ) {
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
				return cli.fatal( 'Init Error: ' + error );
			}
			processCommand( context, args, options, wpApi );
		});
	});
}

function main( argv, context, wpApi ) {
	sequence( modules, 'load', [ context, wpApi ], function ( error ) {
		if ( error ) {
			console.log( 'Load Error: ' + error );
			return;
		}
		afterLoad( argv, context, wpApi );
	});
}

module.exports.main = main;
