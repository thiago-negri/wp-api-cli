var cliMedia;

function media_list( cli, args, options, api ) {
	api.listMedias( function ( error, data ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( data );
	});
}

function media_create( cli, args, options, api ) {
	resolveMedia( args, options, function ( error, theMedia ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.createMedia( theMedia, function ( error, createdMedia ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Media created.' );
			console.log( createdMedia );
		});
	});
}

function media_get( cli, args, options, api ) {
	api.getMedia( options.media_id, function ( error, theMedia ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( theMedia );
	});
}

function media_update( cli, args, options, api ) {
	resolveMedia( args, options, function ( error, theMedia ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.updateMedia( theMedia, function ( error, updatedMedia ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Media updated.' );
			console.log( updatedMedia );
		});
	});
}

function media_delete( cli, args, options, api ) {
	api.deleteMedia( options.media_id, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Media deleted.' );
	});
}

function resolveMedia( args, options, callback ) {
	if ( options.media_json !== null ) {
		fs.readFile( options.media_json, 'utf8', function ( error, fileContent ) {
			var theMedia;

			if ( error ) {
				callback( error );
				return;
			}

			theMedia = fileContent;

			loadMediaFile( args, options, theMedia );

			callback( false, theMedia );
		});
	} else {
		var	theMedia = {};

		loadMediaFile( args, options, theMedia );

		if ( options.media_date !== null ) {
			theMedia.date = options.media_date;
		}
		if ( options.media_date_gmt !== null ) {
			theMedia.date_gmt = options.media_date_gmt;
		}
		if ( options.media_guid !== null ) {
			theMedia.guid = options.media_guid;
		}
		if ( options.media_id !== null ) {
			theMedia.id = options.media_id;
		}
		if ( options.media_link !== null ) {
			theMedia.link = options.media_link;
		}
		if ( options.media_modified !== null ) {
			theMedia.modified = options.media_modified;
		}
		if ( options.media_modified_gmt !== null ) {
			theMedia.modified_gmt = options.media_modified_gmt;
		}
		if ( options.media_password !== null ) {
			theMedia.password = options.media_password;
		}
		if ( options.media_slug !== null ) {
			theMedia.slug = options.media_slug;
		}
		if ( options.media_status !== null ) {
			theMedia.status = options.media_status;
		}
		if ( options.media_type !== null ) {
			theMedia.type = options.media_type;
		}
		if ( options.media_title !== null ) {
			theMedia.title = options.media_title;
		}
		if ( options.media_author !== null ) {
			theMedia.author = options.media_author;
		}
		if ( options.media_comment_status !== null ) {
			theMedia.comment_status = options.media_comment_status;
		}
		if ( options.media_ping_status !== null ) {
			theMedia.ping_status = options.media_ping_status;
		}
		if ( options.media_alt_text !== null ) {
			theMedia.alt_text = options.media_alt_text;
		}
		if ( options.media_caption !== null ) {
			theMedia.caption = options.media_caption;
		}
		if ( options.media_description !== null ) {
			theMedia.description = options.media_description;
		}
		if ( options.media_media_type !== null ) {
			theMedia.media_type = options.media_media_type;
		}
		if ( options.media_media_details !== null ) {
			theMedia.media_details = options.media_media_details;
		}
		if ( options.media_post !== null ) {
			theMedia.post = options.media_post;
		}
		if ( options.media_source_url !== null ) {
			theMedia.source_url = options.media_source_url;
		}

		callback( false, theMedia );
	}
}

function loadMediaFile( args, options, theMedia ) {
	if ( options.media_file !== null ) {
		if ( options.media_file_name !== null || options.media_file_type !== null ) {
			theMedia.file = {
				value: fs.createReadStream( options.media_file ),
				options: {
					filename:    options.media_file_name,
					contentType: options.media_file_type
				}
			};
		} else {
			theMedia.file = fs.createReadStream( options.media_file );
		}
	}
}

cliMedia = {

	options: {
		/*
		 * Media schema
		 *
		 * Helpers: 'media_json', 'media_file', 'media_file_name', 'media_file_type'
		 */
		media_json:           [ false, 'Content of FILE will be used as the entire request, other "media_*" options are ignored, except for "media_file" and "media_file_name".', 'FILE' ],
		media_file:           [ false, 'FILE will be used as the media to be created.', 'FILE' ],
		media_file_name:      [ false, 'File name of the attachment. If using this, also set "media_file_type".', 'STRING' ],
		media_file_type:      [ false, 'Content-Type of the attachment. If using this, also set "media_file_name".', 'STRING' ],
		media_date:           [ false, 'The date the object was published.', 'STRING' ],
		media_date_gmt:       [ false, 'The date the object was published, as GMT.', 'STRING' ],
		media_guid:           [ false, 'The globally unique identifier for the object.', 'STRING' ],
		media_id:             [ false, 'Unique identifier for the object.', 'STRING' ],
		media_link:           [ false, 'URL to the object.', 'STRING' ],
		media_modified:       [ false, 'The date the object was last modified.', 'STRING' ],
		media_modified_gmt:   [ false, 'The date the object was last modified, as GMT.', 'STRING' ],
		media_password:       [ false, 'A password to protect access to the post.', 'STRING' ],
		media_slug:           [ false, 'An alphanumeric identifier for the object unique to its type.', 'STRING' ],
		media_status:         [ false, 'A named status for the object.', 'STRING' ],
		media_type:           [ false, 'Type of Post for the object.', 'STRING' ],
		media_title:          [ false, 'The title for the object.', 'STRING' ],
		media_author:         [ false, 'The ID for the author of the object.', 'STRING' ],
		media_comment_status: [ false, 'Whether or not comments are open on the object.', 'STRING' ],
		media_ping_status:    [ false, 'Whether or not the object can be pinged.', 'STRING' ],
		media_alt_text:       [ false, 'Alternative text to display when attachment is not displayed.', 'STRING' ],
		media_caption:        [ false, 'The caption for the attachment.', 'STRING' ],
		media_description:    [ false, 'The description for the attachment.', 'STRING' ],
		media_media_type:     [ false, 'Type of attachment.', 'STRING' ],
		media_media_details:  [ false, 'Details about the attachment file, specific to its type.', 'STRING' ],
		media_post:           [ false, 'The ID for the associated post of the attachment.', 'STRING' ],
		media_source_url:     [ false, 'URL to the original attachment file.', 'STRING' ],
	},

	commands: {
		media_list: {
			label: 'List all Medias',
			handler: media_list,
		},
		media_create: {
			label: 'Create a Media, use "media_*" options',
			handler: media_create,
		},
		media_get: {
			label: 'Retrieve a Media, use "media_id" option',
			handler: media_get,
		},
		media_update: {
			label: 'Update a Media, use "media_*" options',
			handler: media_update,
		},
		media_delete: {
			label: 'Delete a Media, use "media_id" option',
			handler: media_delete,
		},
	},

};

module.exports = cliMedia;
