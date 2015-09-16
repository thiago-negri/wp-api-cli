'use strict';

var	fs       = require( 'fs'       ),
	open     = require( 'open'     ),
	readline = require( 'readline' );

/**
 * Resolve OAuth file name.
 *
 * Resolves to file from command line option, if present.
 * Otherwise, resolves to file from environment context.
 *
 * @param context Environment context.
 * @param options Command line options.
 * @return OAuth file name.
 */
function resolveOAuthFile( context, options ) {
	if ( options.parent.oauth_file ) {
		return options.parent.oauth_file;
	}
	return context.oauthFile;
}

/**
 * Initializes authentication.
 *
 * Use HTTP Basic Auth if the options are set.
 * If no options for HTTP Basic Auth are set, try to use OAuth by reading OAuth credentials file.
 * If it is not present, fallback to no authentication at all.
 */
function init( context, api, options, callback ) {
	var	oauthFile = resolveOAuthFile( context, options );

	if ( options.parent.http_user || options.parent.http_pass ) {
		api.setBasicAuth({
			user: options.parent.http_user,
			pass: options.parent.http_pass,
		});
		return callback( null, 'Using HTTP Basic authentication.' );
	}

	fs.readFile( oauthFile, 'utf8', function ( error, content ) {
		var oauthConfig;

		if ( error ) {
			if ( error.code === 'ENOENT' ) {
				return callback( null, 'Not using authentication.' );
			}
			return callback( error );
		}

		oauthConfig = JSON.parse( content );
		api.setOAuth( oauthConfig );
		return callback( null, 'Using OAuth authentication.' );
	});
}

/**
 * Authenticates using OAuth.
 *
 * 1. CLI fetches a Request Token.
 * 2. CLI opens default browser with Authorization URL.
 * 3. User authorizes via browser.
 * 4. User copies the Verification Token from the browser and paste it in the command line.
 * 5. CLI exchanges the Verification Token by an Access Token.
 * 6. CLI saves the Access Token in a file for further use.
 *
 * Uses options 'oauth_key' and 'oauth_secret' to set Consumer Key and Consumer Secret.
 */
function authenticate( context, api, options, callback ) {
	var oauthConfig = {
			oauth_consumer_key:    options.oauth_key,
			oauth_consumer_secret: options.oauth_secret
		};

	if ( ! oauthConfig.oauth_consumer_key || ! oauthConfig.oauth_consumer_secret ) {
		return callback( 'Missing OAuth consumer key and secret.' );
	}

	api.fetchOauthRequestToken( oauthConfig, function ( error, response ) {
		var rl;

		if ( error ) {
			return callback( error );
		}

		oauthConfig.oauth_token = response.oauth_token;
		oauthConfig.oauth_token_secret = response.oauth_token_secret;

		console.log( 'Follow authorization process on browser.' );
		open( response.authorizeUrl );

		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question( 'Enter your verification token: ', function ( verificationToken ) {
			rl.close();

			if ( ! verificationToken ) {
				return callback( 'You need to type a verification token.' );
			}

			oauthConfig.oauth_verifier = verificationToken;

			api.fetchOauthAccessToken( oauthConfig, function ( error, response ) {
				var	oauthCredentials,
					oauthFile = resolveOAuthFile( context, options );

				if ( error ) {
					return callback( error );
				}

				oauthCredentials = {
					oauth_consumer_key:    oauthConfig.oauth_consumer_key,
					oauth_consumer_secret: oauthConfig.oauth_consumer_secret,
					oauth_token:           response.oauth_token,
					oauth_token_secret:    response.oauth_token_secret
				};

				fs.writeFile( oauthFile, JSON.stringify( oauthCredentials ), function ( error ) {
					if ( error ) {
						return callback( error );
					}
					return callback( null, 'Credentials saved as "' + oauthFile + '". This is a sensitive file, make sure to protect it.' );
				});
			});
		});
	});
}

/**
 * Removes OAuth token file from file system.
 *
 * To make it harder to recover the file, it tries to overwrite the file with an OAuth configuration full of zeroes before deleting.
 */
function logout( context, api, options, callback ) {
	var	oauthFile = resolveOAuthFile( context, options ),
		zeroes = {
			oauth_consumer_key: '000000000000',
			oauth_consumer_secret: '000000000000000000000000000000000000000000000000',
			oauth_token: '000000000000000000000000',
			oauth_token_secret: '000000000000000000000000000000000000000000000000',
		};
	fs.writeFile( oauthFile, JSON.stringify( zeroes ), function ( error ) {
		if ( error ) {
			/*
			 * Only log the error, do not prevent file deletion.
			 */
			console.log( 'WARN:', error );
		}
		fs.unlink( oauthFile, function ( error ) {
			if ( error ) {
				return callback( error );
			}
			return callback( null, 'Deleted "' + oauthFile + '"' );
		});
	});
}

/**
 * The 'auth' module definition.
 */
module.exports = {
	init: init,

	options: {
		/* HTTP Basic-Auth */
		http_user: {
			alias: 'u',
			label: 'Set username to use for HTTP Basic Authentication',
			type : 'STRING',
		},
		http_pass: {
			alias: 'p',
			label: 'Set password to use for HTTP Basic Authentication',
			type : 'STRING',
		},

		/* OAuth */
		oauth_file: {
			alias: 'o',
			label: 'OAuth authorization file created by "authenticate" command',
			type : 'STRING',
		},
	},

	commands: {
		authenticate: {
			label: 'Authenticate with site, will issue OAuth tokens',
			handler: authenticate,
			options: {
				oauth_key: {
					label: 'OAuth Consumer Key',
					type : 'STRING',
				},
				oauth_secret: {
					label: 'OAuth Consumer Secret',
					type : 'STRING'
				},
			}
		},
		logout: {
			label: 'Remove OAuth tokens from file system',
			handler: logout,
		},
	},
};