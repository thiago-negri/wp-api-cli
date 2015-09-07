'use strict';

/**
 * Module 'describe' definition.
 */
module.exports = {
	commands: {
		describe: {
			label: 'Describe the API.',
			handler: function ( context, cli, args, options, api, callback ) {
				api.describe( callback );
			},
		},
	},
};