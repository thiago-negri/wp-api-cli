'use strict';

var cliDescribe;

function describe( context, cli, args, options, api, callback ) {
	api.describe( function ( error, description ) {
		if ( error ) {
			cli.fatal( error );
			return callback();
		}
		console.log( JSON.stringify( description, null, '  ' ) );
		return callback();
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
