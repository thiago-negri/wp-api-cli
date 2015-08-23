var cliPosts;

/*
 * Post
 */

function post_list( cli, args, options, api ) {
	api.listPosts( function ( error, posts ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( posts );
	});
}

function post_get( cli, args, options, api ) {
	api.getPost( options.post_id, function ( error, thePost ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( thePost );
	});
}

function post_create( cli, args, options, api ) {
	resolvePost( args, options, function ( error, thePost ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.createPost( thePost, function ( error, createdPost ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Post created.' );
			console.log( createdPost );
		});
	});
}

function post_update( cli, args, options, api ) {
	resolvePost( args, options, function ( error, thePost ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.updatePost( thePost, function ( error, updatedPost ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Post updated.' );
			console.log( updatedPost );
		});
	});
}

function post_delete( cli, args, options, api ) {
	api.deletePost( options.post_id, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Post deleted.' );
	});
}

function resolvePost( args, options, callback ) {
	if ( options.post_json !== null ) {
		fs.readFile( options.post_json, 'utf8', function ( error, fileContent ) {
			if ( error ) {
				callback( error );
				return;
			}
			callback( false, fileContent );
		});
	} else {
		resolvePostContent( args, options, function ( error, postContent ) {
			var	thePost = {};

			if ( error ) {
				callback( error );
				return;
			}

			if ( postContent !== null ) {
				thePost.content = postContent;
			}
			if ( options.post_date !== null ) {
				thePost.date = options.post_date;
			}
			if ( options.post_date_gmt !== null ) {
				thePost.date_gmt = options.post_date_gmt;
			}
			if ( options.post_guid !== null ) {
				thePost.guid = options.post_guid;
			}
			if ( options.post_id !== null ) {
				thePost.id = options.post_id;
			}
			if ( options.post_link !== null ) {
				thePost.link = options.post_link;
			}
			if ( options.post_modified !== null ) {
				thePost.modified = options.post_modified;
			}
			if ( options.post_modified_gmt !== null ) {
				thePost.modified_gmt = options.post_modified_gmt;
			}
			if ( options.post_password !== null ) {
				thePost.password = options.post_password;
			}
			if ( options.post_slug !== null ) {
				thePost.slug = options.post_slug;
			}
			if ( options.post_status !== null ) {
				thePost.status = options.post_status;
			}
			if ( options.post_type !== null ) {
				thePost.type = options.post_type;
			}
			if ( options.post_title !== null ) {
				thePost.title = options.post_title;
			}
			if ( options.post_author !== null ) {
				thePost.author = options.post_author;
			}
			if ( options.post_excerpt !== null ) {
				thePost.excerpt = options.post_excerpt;
			}
			if ( options.post_featured_image !== null ) {
				thePost.featured_image = options.post_featured_image;
			}
			if ( options.post_comment_status !== null ) {
				thePost.comment_status = options.post_comment_status;
			}
			if ( options.post_ping_status !== null ) {
				thePost.ping_status = options.post_ping_status;
			}
			if ( options.post_format !== null ) {
				thePost.format = options.post_format;
			}
			if ( options.post_sticky !== null ) {
				thePost.sticky = options.post_sticky;
			}

			callback( false, thePost );
		});
	}
}

function resolvePostContent( args, options, callback ) {
	if ( options.post_content_file !== null ) {
		if ( options.post_content_file === 'stdin' ) {
			cli.info( 'Loading post content from STDIN.' );
			cli.withStdin( function ( stdin ) {
				callback( false, stdin );
			});
		} else {
			cli.info( 'Loading post content from file "' + options.post_content_file + '".' );
			fs.readFile( options.post_content_file, 'utf8', function ( error, fileContent ) {
				if ( error ) {
					callback( 'Error while loading post content from file "' + options.post_content_file + '": ' + error );
				}
				callback( false, fileContent );
			});
		}
	} else {
		callback( false, options.post_content );
	}
}

/*
 * Meta for a Post
 */

function meta_list( cli, args, options, api ) {
	api.listMeta( options.post_id, function ( error, metas ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( metas );
	});
}

function meta_create( cli, args, options, api ) {
	resolveMeta( args, options, function ( error, theMeta ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.createMeta( options.post_id, theMeta, function ( error, createdMeta ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Meta created.' );
			console.log( createdMeta );
		});
	});
}

function meta_get( cli, args, options, api ) {
	api.getMeta( options.post_id, options.meta_id, function ( error, theMeta ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( theMeta );
	});
}

function meta_update( cli, args, options, api ) {
	resolveMeta( args, options, function ( error, theMeta ) {
		if ( error ) {
			callback( error );
			return;
		}

		api.updateMeta( options.post_id, theMeta, function ( error, updatedMeta ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Meta updated.' );
			console.log( updatedMeta );
		});
	});
}

function meta_delete( cli, args, options, api ) {
	api.deleteMeta( options.post_id, options.meta_id, function ( error, theMeta ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Meta deleted.' );
	});
}

function resolveMeta( args, options, callback ) {
	if ( options.meta_json !== null ) {
		fs.readFile( options.meta_json, 'utf8', function ( error, fileContent ) {
			if ( error ) {
				callback( error );
				return;
			}
			callback( false, fileContent );
		});
	} else {
		var	theMeta = {};

		if ( options.meta_id !== null ) {
			theMeta.id = options.meta_id;
		}
		if ( options.meta_key !== null ) {
			theMeta.key = options.meta_key;
		}
		if ( options.meta_value !== null ) {
			theMeta.value = options.meta_value;
		}

		callback( false, theMeta );
	}
}

/*
 * Revisions for a Post
 */

function revision_list( cli, args, options, api ) {
	api.listRevision( options.post_id, function ( error, revisions ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( revisions );
	});
}

function revision_get( cli, args, options, api ) {
	api.getRevision( options.post_id, options.revision_id, function ( error, revision ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( revision );
	});
}

function revision_delete( cli, args, options, api ) {
	api.deleteRevision( options.post_id, options.revision_id, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Revision deleted.' );
	});
}

/*
 * CLI Module
 */

cliPosts = {

	options: {
		/*
		 * Post schema
		 *
		 * Helpers: 'post_json', 'post_content_file'.
		 */
		post_json:           [ false, 'Content of FILE will be used as the entire request, other "post_*" options are ignored.', 'FILE' ],
		post_date:           [ false, 'The date the object was published.', 'STRING' ],
		post_date_gmt:       [ false, 'The date the object was published, as GMT.', 'STRING' ],
		post_guid:           [ false, 'The globally unique identifier for the object.', 'STRING' ],
		post_id:             [ false, 'Unique identifier for the object.', 'STRING' ],
		post_link:           [ false, 'URL to the object.', 'STRING' ],
		post_modified:       [ false, 'The date the object was last modified.', 'STRING' ],
		post_modified_gmt:   [ false, 'The date the object was last modified, as GMT.', 'STRING' ],
		post_password:       [ false, 'A password to protect access to the post.', 'STRING' ],
		post_slug:           [ false, 'An alphanumeric identifier for the object unique to its type.', 'STRING' ],
		post_status:         [ false, 'A named status for the object.', 'STRING' ],
		post_type:           [ false, 'Type of Post for the object.', 'STRING' ],
		post_title:          [ false, 'The title for the object.', 'STRING' ],
		post_content:        [ false, 'The content for the object.', 'STRING' ],
		post_content_file:   [ false, 'Content of FILE will be used as content of post, use "stdin" to load from STDIN.', 'FILE' ],
		post_author:         [ false, 'The ID for the author of the object.', 'STRING' ],
		post_excerpt:        [ false, 'The excerpt for the object.', 'STRING' ],
		post_featured_image: [ false, 'ID of the featured image for the object.', 'STRING' ],
		post_comment_status: [ false, 'Whether or not comments are open on the object.', 'STRING' ],
		post_ping_status:    [ false, 'Whether or not the object can be pinged.', 'STRING' ],
		post_format:         [ false, 'The format for the object.', 'STRING' ],
		post_sticky:         [ false, 'Whether or not the object should be treated as sticky. Accepts true, false.', 'STRING' ],

		/*
		 * Meta for a Post schema
		 *
		 * Helpers: 'meta_json'
		 */
		meta_json:  [ false, 'Content of FILE will be used as the entire request, other "meta_*" options are ignored.', 'FILE' ],
		meta_id:    [ false, 'Unique identifier for the object.', 'STRING' ],
		meta_key:   [ false, 'The key for the custom field.', 'STRING' ],
		meta_value: [ false, 'The value of the custom field.', 'STRING' ],

		/*
		 * Revisions for a Post schema
		 */
		revision_id: [ false, 'Unique identifier for the object.', 'STRING' ],
	},

	commands: {
		/* Post */
		post_list: {
			label: 'List all Posts',
			handler: post_list,
		},
		post_create: {
			label: 'Create a Post, use "post_*" options',
			handler: post_create,
		},
		post_get: {
			label: 'Retrieve a Post, use "post_id" option',
			handler: post_get,
		},
		post_update: {
			label: 'Update a Post, use "post_*" options',
			handler: post_update,
		},
		post_delete: {
			label: 'Delete a Post, use "post_id" option',
			handler: post_delete,
		},

		/* Meta for a Post */
		meta_list: {
			label: 'List all Meta for a Post, use "post_id" option',
			handler: meta_list,
		},
		meta_create: {
			label: 'Create a Meta for a Post, use "post_id" and "meta_*" options',
			handler: meta_create,
		},
		meta_get: {
			label: 'Retrieve a Meta for a Post, use "post_id" and "meta_id" options',
			handler: meta_get,
		},
		meta_update: {
			label: 'Update a Meta for a Post, use "post_id" and "meta_*" options',
			handler: meta_update,
		},
		meta_delete: {
			label: 'Delete a Meta for a Post, use "post_id" and "meta_id" options',
			handler: meta_delete,
		},

		/* Revisions for a Post */
		revision_list: {
			label: 'List all Revisions for a Post, use "post_id" option',
			handler: revision_list,
		},
		revision_get: {
			label: 'Retrieve a Revision for a Post, use "post_id" and "revision_id" options',
			handler: revision_get,
		},
		revision_delete: {
			label: 'Delete a Revision for a Post, use "post_id" and "revision_id" options',
			handler: revision_delete,
		},
	},

};

module.exports = cliPosts;
