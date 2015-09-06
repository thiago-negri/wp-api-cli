'use strict';

/**
 * Handles attaching files to the request made to WP-API.
 */

var	fs = require( 'fs' );

module.exports = {

	options: {
		'attachment': {
			label: 'Add FILE as attachment.',
			type : 'FILE',
		},
		'attachment_type': {
			label: 'Content-Type of attachment.',
			type : 'STRING',
		},
		'attachment_name': {
			label: 'Name of attachment.',
			type : 'STRING',
		},
	},

	init: function ( context, cli, args, options, api, callback ) {
		if ( options.attachment ) {
			api.setAttachment({
				file: options.attachment,
				name: options.attachment_name,
				type: options.attachment_type,
			});
		}
		return callback();
	},

};
