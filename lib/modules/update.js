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
						return callback( 'Could not fetch API definitions: ' + error );
					}
					fs.writeFile( context.apiDescriptionFile, JSON.stringify( description ), function ( error ) {
						if ( error ) {
							return callback( 'Could not update API definitions: ' + error );
						}
						return callback( null, 'Definitions updated.' );
					});
				});
			},
		},
	},
};
