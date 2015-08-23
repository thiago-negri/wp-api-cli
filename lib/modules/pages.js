var cliPages;

function page_list( cli, args, options, api ) {
	api.listPages( function ( error, pages ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( pages );
	});
}

function page_get( cli, args, options, api ) {
	api.getPage( options.page_id, function ( error, thePage ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( thePage );
	});
}

function page_create( cli, args, options, api ) {
	resolvePage( args, options, function ( error, thePage ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.createPage( thePage, function ( error, createdPage ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Page created.' );
			console.log( createdPage );
		});
	});
}

function page_update( cli, args, options, api ) {
	resolvePage( args, options, function ( error, thePage ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.updatePage( thePage, function ( error, updatedPage ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Page updated.' );
			console.log( updatedPage );
		});
	});
}

function page_delete( cli, args, options, api ) {
	api.deletePage( options.page_id, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Page deleted.' );
	});
}

function resolvePage( args, options, callback ) {
	if ( options.page_json !== null ) {
		fs.readFile( options.page_json, 'utf8', function ( error, fileContent ) {
			if ( error ) {
				callback( error );
				return;
			}
			callback( false, fileContent );
		});
	} else {
		resolvePageContent( args, options, function ( error, pageContent ) {
			var	thePage = {};

			if ( error ) {
				callback( error );
				return;
			}

			if ( pageContent !== null ) {
				thePage.content = pageContent;
			}
			if ( options.page_date !== null ) {
				thePage.date = options.page_date;
			}
			if ( options.page_date_gmt !== null ) {
				thePage.date_gmt = options.page_date_gmt;
			}
			if ( options.page_guid !== null ) {
				thePage.guid = options.page_guid;
			}
			if ( options.page_id !== null ) {
				thePage.id = options.page_id;
			}
			if ( options.page_link !== null ) {
				thePage.link = options.page_link;
			}
			if ( options.page_modified !== null ) {
				thePage.modified = options.page_modified;
			}
			if ( options.page_modified_gmt !== null ) {
				thePage.modified_gmt = options.page_modified_gmt;
			}
			if ( options.page_password !== null ) {
				thePage.password = options.page_password;
			}
			if ( options.page_slug !== null ) {
				thePage.slug = options.page_slug;
			}
			if ( options.page_status !== null ) {
				thePage.status = options.page_status;
			}
			if ( options.page_type !== null ) {
				thePage.type = options.page_type;
			}
			if ( options.page_parent !== null ) {
				thePage.parent = options.page_parent;
			}
			if ( options.page_title !== null ) {
				thePage.title = options.page_title;
			}
			if ( options.page_author !== null ) {
				thePage.author = options.page_author;
			}
			if ( options.page_excerpt !== null ) {
				thePage.excerpt = options.page_excerpt;
			}
			if ( options.page_featured_image !== null ) {
				thePage.featured_image = options.page_featured_image;
			}
			if ( options.page_comment_status !== null ) {
				thePage.comment_status = options.page_comment_status;
			}
			if ( options.page_ping_status !== null ) {
				thePage.ping_status = options.page_ping_status;
			}
			if ( options.page_menu_order !== null ) {
				thePage.menu_order = options.page_menu_order;
			}
			if ( options.page_template !== null ) {
				thePage.template = options.page_template;
			}

			callback( false, thePage );
		});
	}
}

function resolvePageContent( args, options, callback ) {
	if ( options.page_content_file !== null ) {
		if ( options.page_content_file === 'stdin' ) {
			cli.info( 'Loading page content from STDIN.' );
			cli.withStdin( function ( stdin ) {
				callback( false, stdin );
			});
		} else {
			cli.info( 'Loading page content from file "' + options.page_content_file + '".' );
			fs.readFile( options.page_content_file, 'utf8', function ( error, fileContent ) {
				if ( error ) {
					callback( 'Error while loading page content from file "' + options.page_content_file + '": ' + error );
				}
				callback( false, fileContent );
			});
		}
	} else {
		callback( false, options.page_content );
	}
}

cliPages = {

	options: {
		/*
		 * Page schema
		 *
		 * Helpers: 'page_json', 'page_content_file'.
		 */
		page_json:           [ false, 'Content of FILE will be used as the entire request, other "page_*" options are ignored.', 'FILE' ],
		page_date:           [ false, 'The date the object was published.', 'STRING' ],
		page_date_gmt:       [ false, 'The date the object was published, as GMT.', 'STRING' ],
		page_guid:           [ false, 'The globally unique identifier for the object.', 'STRING' ],
		page_id:             [ false, 'Unique identifier for the object.', 'STRING' ],
		page_link:           [ false, 'URL to the object.', 'STRING' ],
		page_modified:       [ false, 'The date the object was last modified.', 'STRING' ],
		page_modified_gmt:   [ false, 'The date the object was last modified, as GMT.', 'STRING' ],
		page_password:       [ false, 'A password to protect access to the post.', 'STRING' ],
		page_slug:           [ false, 'An alphanumeric identifier for the object unique to its type.', 'STRING' ],
		page_status:         [ false, 'A named status for the object.', 'STRING' ],
		page_type:           [ false, 'Type of Post for the object.', 'STRING' ],
		page_parent:         [ false, 'The ID for the parent of the object.', 'STRING' ],
		page_title:          [ false, 'The title for the object.', 'STRING' ],
		page_content:        [ false, 'The content for the object.', 'STRING' ],
		page_content_file:   [ false, 'Content of FILE will be used as content of page, use "stdin" to load from STDIN.', 'FILE' ],
		page_author:         [ false, 'The ID for the author of the object.', 'STRING' ],
		page_excerpt:        [ false, 'The excerpt for the object.', 'STRING' ],
		page_featured_image: [ false, 'ID of the featured image for the object.', 'STRING' ],
		page_comment_status: [ false, 'Whether or not comments are open on the object.', 'STRING' ],
		page_ping_status:    [ false, 'Whether or not the object can be pinged.', 'STRING' ],
		page_menu_order:     [ false, 'The order of the object in relation to other object of its type.', 'STRING' ],
		page_template:       [ false, 'The theme file to use to display the object.', 'STRING' ],
	},

	commands: {
		page_list: {
			label: 'List all Pages',
			handler: page_list,
		},
		page_create: {
			label: 'Create a Page, use "page_*" options',
			handler: page_create,
		},
		page_get: {
			label: 'Retrieve a Page, use "page_id" option',
			handler: page_get,
		},
		page_update: {
			label: 'Update a Page, use "page_*" options',
			handler: page_update,
		},
		page_delete: {
			label: 'Delete a Page, use "page_id" option',
			handler: page_delete,
		},
	},

};

module.exports = cliPages;
