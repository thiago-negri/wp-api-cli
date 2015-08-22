#!/usr/bin/env node

var	fs       = require( 'fs'           ),
	cli      = require( 'cli'          ),
	readline = require( 'readline'     ),
	open     = require( 'open'         ),
	WpApi    = require( './lib/wp-api' );

cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );

cli.option_width = 38;

cli.parse({
	site:  [ 's', '(Required) Set base URL to use', 'STRING' ],
	debug: [ 'd', 'Turns on debugging mode, will output interactions with server' ],

	/* Support HTTPS with self signed certificate. */
	insecure: [ 'k', 'Allow connections to SSL sites without certs' ],

	/* HTTP Basic-Auth */
	user: [ 'u', 'Set username to use for HTTP Basic Authentication', 'STRING' ],
	pass: [ 'p', 'Set password to use for HTTP Basic Authentication', 'STRING' ],

	/* OAuth */
	oauth_key:    [ false, 'OAuth Consumer Key', 'STRING' ],
	oauth_secret: [ false, 'OAuth Consumer Secret', 'STRING' ],
	oauth_file:   [ 'o', 'OAuth authorization file created by "authenticate" command', 'FILE', 'oauth.json' ],

	/*
	 * Post schema
	 *
	 * Helpers: 'post_json', 'post_content_file'.
	 */
	post_json:           [ false, 'Content of FILE will be used as the entire request, other "file_*" options are ignored.', 'FILE' ],
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
}, {
	authenticate: 'Authenticate with site, will issue OAuth tokens',
	post_list:    'List all published posts',
	post_create:  'Creates a new post, use "post_*" options',
	post_update:  'Updates a post, use "post_*" options'
});

cli.main( function ( args, options ) {
	var	config,
		wpApi;

	validateAndSanitize( options );

	/* Allow connections to SSL sites without certs */
	if ( options.insecure ) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	if ( ( ! options.user || ! options.pass ) && cli.command !== 'authenticate' ) {
		cli.info( 'Using OAuth authentication.' );
		fs.readFile( options.oauth_file, 'utf8', function ( error, content ) {
			var oauthConfig;

			if ( error ) {
				cli.fatal( error );
			}

			oauthConfig = JSON.parse( content );

			config = {
				site:  options.site,
				debug: options.debug,
				oauth: oauthConfig
			};

			wpApi = new WpApi( config );

			processCommand( args, options, wpApi );
		});
	} else {
		cli.info( 'Using HTTP Basic authentication.' );
		config = {
			site:  options.site,
			user:  options.user,
			pass:  options.pass,
			debug: options.debug
		};

		wpApi = new WpApi( config );

		processCommand( args, options, wpApi );
	}
});

/**
 * Validate and sanitize user input.
 */
function validateAndSanitize( options ) {
	if ( ! options.site ) {
		cli.fatal( 'Missing base URL. Please, set a base URL by using `-s` or `--site`.' );
	}
	if ( options.site[-1] !== '/' ) {
		options.site = options.site + '/';
	}
}

function processCommand( args, options, wpApi ) {
	switch ( cli.command ) {
		case 'authenticate':
			authenticate( args, options, wpApi );
			break;

		case 'post_list':
			wpApi.listPosts( function ( error, data ) {
				if ( error ) {
					cli.fatal( error );
				}
				console.log( data );
			});
			break;

		case 'post_create':
			createPost( args, options, wpApi );
			break;

		case 'post_update':
			updatePost( args, options, wpApi );
			break;
	}
}

function authenticate( args, options, wpApi ) {
	var oauthConfig = {
		oauth_consumer_key:    options.oauth_key,
		oauth_consumer_secret: options.oauth_secret
	};

	if ( ! oauthConfig.oauth_consumer_key || ! oauthConfig.oauth_consumer_secret ) {
		cli.fatal( 'Missing OAuth consumer key and secret.' );
	}

	wpApi.fetchOauthRequestToken( oauthConfig, function ( error, response ) {
		var rl;
		if ( error ) {
			cli.fatal( error );
		}

		oauthConfig.oauth_token = response.oauth_token;
		oauthConfig.oauth_token_secret = response.oauth_token_secret;

		cli.info( 'Follow authorization process on browser.' );
		open( response.authorizeUrl );

		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question( 'Enter your verification token: ', function ( verificationToken ) {
			if ( ! verificationToken ) {
				return;
			}

			oauthConfig.oauth_verifier = verificationToken;

			wpApi.fetchOauthAccessToken( oauthConfig, function ( error, response ) {
				if ( error ) {
					cli.fatal( error );
				}

				var oauthCredentials = {
					oauth_consumer_key:    oauthConfig.oauth_consumer_key,
					oauth_consumer_secret: oauthConfig.oauth_consumer_secret,
					oauth_token:           response.oauth_token,
					oauth_token_secret:    response.oauth_token_secret
				};

				fs.writeFile( 'oauth.json', JSON.stringify( oauthCredentials ), function ( error ) {
					if ( error ) {
						cli.fatal( error );
					}
					cli.ok( 'Credentials saved as "oauth.json". This is a sensitive file, make sure to protect it.');
					rl.close();
				});
			});
		});
	});
}

function createPost( args, options, wpApi, callback ) {
	resolvePost( args, options, function ( error, thePost ) {
		if ( error ) {
			callback( error );
			return;
		}

		wpApi.createPost( thePost, function ( error, createdPost ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Post created.' );
			console.log( createdPost );
		});
	});
}

function updatePost( args, options, wpApi, callback ) {
	resolvePost( args, options, function ( error, thePost ) {
		if ( error ) {
			callback( error );
			return;
		}

		wpApi.updatePost( thePost, function ( error, createdPost ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Post updated.' );
			console.log( createdPost );
		});
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
