var request = require( 'request' );

/**
 * Interacts with WordPress.org REST API v2.
 */
function WpApi( config ) {
	this.site = config.site;
	this.config = config;
	this.debug = config.debug;
	this.request = request.defaults( { json: true } );
}

/**
 * Discovers WP-API base URL from WordPress server.
 *
 * See http://v2.wp-api.org/guide/discovery/
 */
WpApi.prototype.discover = function ( callback ) {
	var self;

	if ( this.baseUrl ) {
		callback();
	}

	if ( this.debug ) {
		console.log( '> HEAD ' + this.site );
	}

	self = this;
	this.request.head( this.site , function ( error, response, body ) {
		if ( error || response.statusCode !== 200 ) {
			callback( 'Error when trying to discover WP-API: ' + response.statusCode + ' ' + error );
		}

		/* FIXME Check how the `response.headers` is constructed when the server returns more than a single 'Link' header. */
		if ( ! response.headers.link ) {
			callback( 'Could not find WP-API on the server. Please, make sure it is activated.' );
		}

		/* FIXME Using regular expression to extract the base URL, there sould be a better way to do this. */
		self.baseUrl = response.headers.link.match( /.*<([^>]*)>; rel="https:\/\/github.com\/WP-API\/WP-API"/ )[1];

		callback();
	});
};

WpApi.prototype.describe = function ( callback ) {
	var self = this;

	if ( this.debug ) {
		console.log( '> GET ' + this.baseUrl );
	}

	this.request.get( this.baseUrl , function ( error, response, body ) {
		if ( error || response.statusCode !== 200 ) {
			callback( 'Error when trying to describe WP-API: ' + response.statusCode + ' ' + error );
		}

		self.wpApi = body;

		callback();
	});
};

WpApi.prototype.authenticate = function ( callback ) {
	/*
	 * FIXME Could not use OAuth1, server keeps returning 401.
	 * FIXME Need to activate SSL on Apache (WAMP).
	 */

	/*	
	var url = context.wpApi.authentication.oauth1.request,
		config = {
			oauth_consumer_key: 'JtnNmhOeI3bS',
			oauth_consumer_secret: 'hYEPcpwMWEInOrKiNNZIKg4h81jDmW21v0p8vTfdYf0qEmje',
			oauth_callback: 'localhost'
		},
		form = null;

	oauth.fetchRequestToken( config, url, form, function ( error, params ) {
		if ( error ) {
			cli.fatal( 'Error when trying to authenticate: ' + error );
		}

		context.oauth = {
			token: params.oauth_token,
			tokenSecret: params.oauth_token_secret
		};

		console.log( context.oauth );
	});
	*/

	this.authenticatedRequest = this.request.defaults({
		auth: {
			user: this.config.user,
			pass: this.config.pass,
			sendImmediately: true
		}
	});

	callback();
};

WpApi.prototype.boilerplate = function ( callback ) {
	var self = this;
	this.discover( function ( error ) {
		if ( error ) {
			callback( error );
		}
		self.describe( function ( error ) {
			if ( error ) {
				callback( error );
			}
			self.authenticate( function ( error ) {
				if ( error ) {
					callback( error );
				}
				callback();
			});
		});
	});
};

WpApi.prototype.listPosts = function ( callback ) {
	var self = this;
	this.boilerplate( function ( error ) {
		var	url = self.baseUrl + 'wp/v2/posts';
		if ( error ) {
			callback( error );
		}
		if ( self.debug ) {
			console.log( '> GET ' + url + ' (with credentials)');
		}
		self.authenticatedRequest.get( url, function ( error, response, body ) {
			if ( error ) {
				callback( error );
			}
			callback( false, body );
		});
	});
};

WpApi.prototype.createPost = function ( thePost, callback ) {
	var	config = {
			url:  this.baseUrl + 'wp/v2/posts',
			body: thePost
		};

	this.authenticatedRequest.post( config, function ( error, response, body ) {
		console.log( body );
	});
};

module.exports = WpApi;
