var	fs       = require( 'fs'       ),
	open     = require( 'open'     ),
	readline = require( 'readline' ),

	cliAuth;

function init( cli, args, options, api, callback ) {
	/*
	 * Use HTTP Basic Auth if the options are set.
	 * If no options for HTTP Basic Auth are set, try to use OAuth by reading OAuth credentials file.
	 * If it is not present, fallback to no authentication at all.
	 */

	if ( options.user || options.pass ) {
		cli.info( 'Using HTTP Basic authentication.' );

		api.setBasicAuth({
			user: options.user,
			pass: options.pass,
		});

		callback();
		return;
	}

	fs.readFile( options.oauth_file, 'utf8', function ( error, content ) {
		var oauthConfig;

		if ( error ) {
			if ( error.code === 'ENOENT' ) {
				cli.info( 'Not using authentication.' );
				callback();
				return;
			} else {
				callback( error );
				return;
			}
		}

		cli.info( 'Using OAuth authentication.' );
		oauthConfig = JSON.parse( content );
		api.setOAuth( oauthConfig );
		callback();
		return;
	});
}

function authenticate( cli, args, options, api ) {
	var	oauthConfig = {
			oauth_consumer_key:    options.oauth_key,
			oauth_consumer_secret: options.oauth_secret
		};

	if ( ! oauthConfig.oauth_consumer_key || ! oauthConfig.oauth_consumer_secret ) {
		cli.fatal( 'Missing OAuth consumer key and secret.' );
	}

	api.fetchOauthRequestToken( oauthConfig, function ( error, response ) {
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
				rl.close();
				return;
			}

			oauthConfig.oauth_verifier = verificationToken;

			api.fetchOauthAccessToken( oauthConfig, function ( error, response ) {
				var oauthCredentials;

				if ( error ) {
					rl.close();
					cli.fatal( error );
				}

				oauthCredentials = {
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

cliAuth = {
	init: init,
	options: {
		/* HTTP Basic-Auth */
		user: [ 'u', 'Set username to use for HTTP Basic Authentication', 'STRING' ],
		pass: [ 'p', 'Set password to use for HTTP Basic Authentication', 'STRING' ],

		/* OAuth */
		oauth_key:    [ false, 'OAuth Consumer Key', 'STRING' ],
		oauth_secret: [ false, 'OAuth Consumer Secret', 'STRING' ],
		oauth_file:   [ 'o', 'OAuth authorization file created by "authenticate" command', 'FILE', 'oauth.json' ],
	},
	commands: {
		authenticate: {
			label: 'Authenticate with site, will issue OAuth tokens',
			handler: authenticate,
		},
	},
};

module.exports = cliAuth;
