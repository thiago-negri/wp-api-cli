'use strict';

/**
 * Module 'describe' definition.
 */
module.exports = {
	commands: {
		describe: {
			label: 'Describe the API.',
			handler: function ( context, api, options, callback ) {
				api.describe( callback );
			},
		},
	},
};