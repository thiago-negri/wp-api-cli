#!/usr/bin/env node

var	fs       = require( 'fs'           ),
	cli      = require( 'cli'          ),
	readline = require( 'readline'     ),
	open     = require( 'open'         ),
	WpApi    = require( './lib/wp-api' );

cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );

cli.option_width = 30;

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

	/* Post */
	post_type:    [ false, 'Post type to be created or updated', 'STRING', 'post' ],
	post_title:   [ false, 'Post title to be created or updated', 'STRING' ],
	post_content: [ false, 'Content of post to be created or updated', 'STRING' ],
	post_file:    [ false, 'Content of FILE will be used as content of post', 'FILE' ]
}, {
	authenticate: 'Authenticate with site, will issue OAuth tokens',
	post_list:    'List all published posts',
	post_create:  'Creates a new post'
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

function createPost( args, options, wpApi ) {
	var fileName = options.post_file,
		thePost = {
			type:  options.post_type,
			title: options.post_title
		},
		callback = function ( error, createdPost ) {
			if ( error ) {
				cli.fatal( error );
			}
			cli.ok( 'Post created.' );
			console.log( createdPost );
		};

	if ( fileName ) {
		fs.readFile( fileName, 'utf8', function ( error, data ) {
			if ( error ) {
				cli.fatal( 'Error while loading post content from file ' + fileName + ': ' + error );
			}
			thePost.content = data;
			wpApi.createPost( thePost, callback );
		});
	} else if ( options.post_content ) {
		thePost.content = options.post_content;
		wpApi.createPost( thePost, callback );
	} else {
		cli.withStdin( function ( stdin ) {
			thePost.content = stdin;
			wpApi.createPost( thePost, callback );
		});
	}
}
