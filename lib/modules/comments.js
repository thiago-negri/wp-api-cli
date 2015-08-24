var cliComments;

function comment_list( cli, args, options, api ) {
	api.listComments( options.comment_post, function ( error, comments ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( comments );
	});
}

function comment_get( cli, args, options, api ) {
	api.getComment( options.comment_id, function ( error, comment ) {
		if ( error ) {
			cli.fatal( error );
		}
		console.log( comment );
	});
}

function comment_create( cli, args, options, api ) {
	resolveComment( args, options, function ( error, comment ) {
		if ( error ) {
			cli.fatal( error );
		}
		api.createComment( comment, function ( error, createdComment ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Comment created.' );
			console.log( createdComment );
		});
	});
}

function comment_update( cli, args, options, api ) {
	resolveComment( args, options, function ( error, comment ) {
		if ( error ) {
			cli.fatal( error );
		}
		api.updateComment( comment, function ( error, updatedComment ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Comment updated.' );
			console.log( updatedComment );
		});
	});
}

function comment_delete( cli, args, options, api ) {
	api.deleteComment( options.comment_id, function ( error ) {
		if ( error ) {
			cli.fatal( error );
		}
		cli.ok( 'Comment deleted.' );
	});
}

function resolveComment( args, options, callback ) {
	if ( options.comment_json !== null ) {
		fs.readFile( options.comment_json, 'utf8', function ( error, fileContent ) {
			if ( error ) {
				callback( error );
				return;
			}
			callback( false, fileContent );
		});
	} else {
		resolveCommentContent( args, options, function ( error, commentContent ) {
			var comment = {};

			if ( error ) {
				callback( error );
				return;
			}

			if ( commentContent !== null ) {
				comment.content = commentContent;
			}

			if ( options.comment_id !== null ) {
				comment.id = options.comment_id;
			}
			if ( options.comment_author !== null ) {
				comment.author = options.comment_author;
			}
			if ( options.comment_author_email !== null ) {
				comment.author_email = options.comment_author_email;
			}
			if ( options.comment_author_ip !== null ) {
				comment.author_ip = options.comment_author_ip;
			}
			if ( options.comment_author_name !== null ) {
				comment.author_name = options.comment_author_name;
			}
			if ( options.comment_author_url !== null ) {
				comment.author_url = options.comment_author_url;
			}
			if ( options.comment_author_user_agent !== null ) {
				comment.author_user_agent = options.comment_author_user_agent;
			}
			if ( options.comment_date !== null ) {
				comment.date = options.comment_date;
			}
			if ( options.comment_date_gmt !== null ) {
				comment.date_gmt = options.comment_date_gmt;
			}
			if ( options.comment_karma !== null ) {
				comment.karma = options.comment_karma;
			}
			if ( options.comment_link !== null ) {
				comment.link = options.comment_link;
			}
			if ( options.comment_parent !== null ) {
				comment.parent = options.comment_parent;
			}
			if ( options.comment_post !== null ) {
				comment.post = options.comment_post;
			}
			if ( options.comment_status !== null ) {
				comment.status = options.comment_status;
			}
			if ( options.comment_type !== null ) {
				comment.type = options.comment_type;
			}

			callback( false, comment );
		});
	}
}

function resolveCommentContent( args, options, callback ) {
	if ( options.comment_content_file !== null ) {
		if ( options.comment_content_file === 'stdin' ) {
			cli.info( 'Loading comment content from STDIN.' );
			cli.withStdin( function ( stdin ) {
				callback( false, stdin );
			});
		} else {
			cli.info( 'Loading comment content from file "' + options.comment_content_file + '".' );
			fs.readFile( options.comment_content_file, 'utf8', function ( error, fileContent ) {
				if ( error ) {
					callback( 'Error while loading comment content from file "' + options.comment_content_file + '": ' + error );
				}
				callback( false, fileContent );
			});
		}
	} else {
		callback( false, options.comment_content );
	}
}

cliComments = {
	options: {
		/*
		 * Comment schema
		 *
		 * Helpers: 'comment_json', 'comment_content_file'
		 */
		comment_json:              [ false, 'Use content of FILE as the request, ignore other "comment_*" options.', 'FILE' ],
		comment_id:                [ false, 'Unique identifier for the object.', 'STRING' ],
		comment_author:            [ false, 'The ID of the user object, if author was a user.', 'STRING' ],
		comment_author_email:      [ false, 'Email address for the object author.', 'STRING' ],
		comment_author_ip:         [ false, 'IP address for the object author.', 'STRING' ],
		comment_author_name:       [ false, 'Display name for the object author.', 'STRING' ],
		comment_author_url:        [ false, 'Url for the object author.', 'STRING' ],
		comment_author_user_agent: [ false, 'User agent for the object author.', 'STRING' ],
		comment_content:           [ false, 'The content for the object.', 'STRING' ],
		comment_content_file:      [ false, 'The content of FILE will be used as content of comment.', 'FILE' ],
		comment_date:              [ false, 'The date the object was published.', 'STRING' ],
		comment_date_gmt:          [ false, 'The date the object was published as GMT.', 'STRING' ],
		comment_karma:             [ false, 'Karma for the object.', 'STRING' ],
		comment_link:              [ false, 'URL to the object.', 'STRING' ],
		comment_parent:            [ false, 'The ID for the parent of the object.', 'STRING' ],
		comment_post:              [ false, 'The ID of the associated post object.', 'STRING' ],
		comment_status:            [ false, 'State of the object.', 'STRING' ],
		comment_type:              [ false, 'Type of Comment for the object.', 'STRING' ],
	},
	commands: {
		comment_list: {
			label: 'List all Comments, may filter by "comment_post".',
			handler: comment_list,
		},
		comment_get: {
			label: 'Retrieve a Comment, use "comment_id" option.',
			handler: comment_get,
		},
		comment_create: {
			label: 'Create a Comment, use "comment_*" options.',
			handler: comment_create,
		},
		comment_update: {
			label: 'Update a Comment, use "comment_*" options.',
			handler: comment_update,
		},
		comment_delete: {
			label: 'Delete a Comment, use "comment_id" option.',
			handler: comment_delete,
		},
	},
};

module.exports = cliComments;
