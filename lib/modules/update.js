/**
 * Handles 'update' command.
 *
 * Fetch API description from discovery mechanism and save it as 'routes.json' to be loaded in
 * further executions.
 */

var	fs = require( 'fs' );

module.exports = {
	commands: {
		update: {
			label: 'Update CLI definitions.',
			handler: function ( cli, args, options, api ) {
				api.describe( function ( error, description ) {
					if ( error ) {
						return cli.fatal( 'Could not fetch API definitions: ' + error );
					}
					fs.writeFile( 'routes.json', JSON.stringify( description.routes ), function ( error ) {
						if ( error ) {
							return cli.fatal( 'Could not update API definitions: ' + error );
						}
						cli.ok( 'Definitions updated.' );
					});
				});
			},
		}
	},
};
