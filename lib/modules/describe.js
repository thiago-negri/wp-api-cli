'use strict';

var cliDescribe;

/**
 * Describes the API.
 */
function describe( context, cli, args, options, api, callback ) {
	api.describe( callback );
}

/**
 * Module 'describe' definition.
 */
cliDescribe = {
	commands: {
		describe: {
			label: 'Describe the API.',
			handler: describe,
		},
	},
};

module.exports = cliDescribe;
