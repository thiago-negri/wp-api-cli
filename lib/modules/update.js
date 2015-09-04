'use strict';

/**
 * Handles 'update' command.
 *
 * Fetch API description from discovery mechanism and save it as 'api.json' to be loaded in
 * further executions.
 */

var	fs = require( 'fs' );

module.exports = {
	commands: {
		update: {
			label: 'Update CLI definitions.',
			handler: function ( context, cli, args, options, api, callback ) {
				api.describe( function ( error, description ) {
					if ( error ) {
						cli.fatal( 'Could not fetch API definitions: ' + error );
						return callback();
					}
					fs.writeFile( context.apiDescriptionFile, JSON.stringify( description ), function ( error ) {
						if ( error ) {
							cli.fatal( 'Could not update API definitions: ' + error );
							return callback();
						}
						cli.ok( 'Definitions updated.' );
						return callback();
					});
				});
			},
		},
	},
};
