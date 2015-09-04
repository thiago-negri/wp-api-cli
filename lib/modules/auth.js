'use strict';

var	fs       = require( 'fs'       ),
	open     = require( 'open'     ),
	readline = require( 'readline' ),

	cliAuth;

function resolveOAuthFile( context, options ) {
	if ( options.oauth_file ) {
		return options.oauth_file;
	}
	return context.oauthFile;
}

function init( context, cli, args, options, api, callback ) {
	var	oauthFile = resolveOAuthFile( context, options );

	/*
	 * Use HTTP Basic Auth if the options are set.
	 * If no options for HTTP Basic Auth are set, try to use OAuth by reading OAuth credentials file.
	 * If it is not present, fallback to no authentication at all.
	 */

	if ( options.user || options.pass ) {
		cli.info( 'Using HTTP Basic authentication.' );

		api.setBasicAuth({
			user: options.http_user,
			pass: options.http_pass,
		});

		return callback();
	}

	fs.readFile( oauthFile, 'utf8', function ( error, content ) {
		var oauthConfig;

		if ( error ) {
			if ( error.code === 'ENOENT' ) {
				cli.info( 'Not using authentication.' );
				return callback();
			}
			return callback( error );
		}

		cli.info( 'Using OAuth authentication.' );
		oauthConfig = JSON.parse( content );
		api.setOAuth( oauthConfig );
		return callback();
	});
}

function authenticate( context, cli, args, options, api, callback ) {
	var	oauthConfig = {
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

		cli.info( 'Follow authorization process on browser.' );
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
					oauthFile = resolveOAuthFile( options );

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

function logout( context, cli, args, options, api, callback ) {
	var	oauthFile = resolveOAuthFile( options );
	fs.unlink( oauthFile, function ( error ) {
		if ( error ) {
			return callback( error );
		}
		return callback( null, 'Deleted "' + oauthFile + '"' );
	});
}

cliAuth = {
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
		oauth_key: {
			label: 'OAuth Consumer Key',
			type : 'STRING',
		},
		oauth_secret: {
			label: 'OAuth Consumer Secret',
			type : 'STRING'
		},
		oauth_file: {
			alias: 'o',
			label: 'OAuth authorization file created by "authenticate" command',
			type : 'FILE',
		},
	},

	commands: {
		authenticate: {
			label: 'Authenticate with site, will issue OAuth tokens',
			handler: authenticate,
		},
		logout: {
			label: 'Remove OAuth tokens from file system',
			handler: logout,
		},
	},
};

module.exports = cliAuth;
