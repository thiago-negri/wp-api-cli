'use strict';

/**
 * Handles attaching files to the request made to WP-API.
 */

module.exports = {

	options: {
		'attachment': {
			label: 'Add FILE as attachment.',
			type : 'STRING',
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

	init: function ( context, api, options, callback ) {
		if ( options.parent.attachment ) {
			api.setAttachment({
				file: options.parent.attachment,
				name: options.parent.attachment_name,
				type: options.parent.attachment_type,
			});
		}
		return callback();
	},

};
