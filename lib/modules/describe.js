'use strict';

var cliDescribe;

function describe( context, cli, args, options, api, callback ) {
	api.describe( function ( error, description ) {
		if ( error ) {
			return callback( error );
		}
		return callback( null, JSON.stringify( description, null, '  ' ) );
	});
}

cliDescribe = {
	commands: {
		describe: {
			label: 'Describe the API.',
			handler: describe,
		},
	},
};

module.exports = cliDescribe;
