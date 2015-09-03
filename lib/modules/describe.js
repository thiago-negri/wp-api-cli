'use strict';

var cliDescribe;

function describe( context, cli, args, options, api ) {
	api.describe( function ( error, description ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( JSON.stringify( description, null, '  ' ) );
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
