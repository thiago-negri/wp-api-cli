'use strict';

/**
 * Handles attaching files to the request made to WP-API.
 */

var	fs = require( 'fs' );

module.exports = {
	options: {
		'attachment'      : [ false, 'Add FILE as attachment.',     'FILE'   ],
		'attachment_type' : [ false, 'Content-Type of attachment.', 'FILE'   ],
		'attachment_name' : [ false, 'Name of attachment.',         'STRING' ],
	},
	init: function ( cli, args, options, api, callback ) {
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
