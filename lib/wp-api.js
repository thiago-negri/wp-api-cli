'use strict';

var	request = require( 'request'     ),
	oauth   = require( 'oauth-lite'  ),
	urllib  = require( 'url'         ),
	qs      = require( 'querystring' ),
	md5     = require( 'md5'         ),
	fs      = require( 'fs'          );

/**
 * Interacts with WordPress.org REST API v2.
 */
function WpApi() {
	this.request = request.defaults( { json: true } );

	/* Defaults. */
	this.method = 'GET';
}

WpApi.prototype.setSite = function ( site ) {
	this.site = site;
};

WpApi.prototype.setBaseUrl = function ( baseUrl ) {
	this.baseUrl = baseUrl;
};

WpApi.prototype.setMethod = function ( method ) {
	this.method = method;
};

WpApi.prototype.setDebug = function ( debug ) {
	this.debug = debug;
};

WpApi.prototype.setOAuth = function ( oauthConfig ) {
	this.oauth = oauthConfig;
};

WpApi.prototype.setBasicAuth = function ( authConfig ) {
	this.basicAuth = authConfig;
};

WpApi.prototype.setForce = function ( force ) {
	this.force = force;
};

WpApi.prototype.setAttachment = function ( attachment ) {
	this.attachment = attachment;
};

WpApi.prototype.fetchOauthRequestToken = function ( oauthConfig, callback ) {
	var self = this;

	oauthConfig.oauth_callback = 'oob';

	self._discover( function ( error ) {
		if ( error ) {
			callback( error );
			return;
		}

		self._describe( function ( error ) {
			var	url = self.wpApi.authentication.oauth1.request,
				form = null;

			if ( error ) {
				callback( error );
				return;
			}

			oauth.fetchRequestToken( oauthConfig, url, form, function ( error, response ) {
				if ( error ) {
					callback( error );
					return;
				}

				response.authorizeUrl = self.wpApi.authentication.oauth1.authorize + '?oauth_token=' + response.oauth_token;

				callback( false, response );
			});
		});
	});
};

WpApi.prototype.fetchOauthAccessToken = function ( oauthConfig, callback ) {
	var self = this;

	self._discover( function ( error ) {
		if ( error ) {
			callback( error );
			return;
		}

		self._describe( function ( error ) {
			var	url = self.wpApi.authentication.oauth1.access,
				form = null;
			if ( error ) {
				callback( error );
				return;
			}

			oauth.fetchAccessToken( oauthConfig, url, form, function ( error, response ) {
				if ( error ) {
					callback( error );
					return;
				}

				callback( false, response );
			});
		});
	});
};

/*
 * Describe
 */
WpApi.prototype.describe = function ( callback ) {
	var self = this;
	self._discover( function ( error ) {
		if ( error ) {
			callback( error );
			return;
		}
		self._describe( 'help', function ( error ) {
			if ( error ) {
				callback( error );
				return;
			}
			callback( false, self.wpApi );
		});
	});
};

/*
 * Request
 */
WpApi.prototype.doRequest = function ( requestConfig, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	data = requestConfig.body,
			actualRequestConfig = {
				method: self.method,
				url: requestConfig.url,
			};

		if ( error ) {
			callback( error );
			return;
		}

		/* Remove '/' from the start of the path, to avoid having double slashes. */
		if ( actualRequestConfig.url[0] === '/' ) {
			actualRequestConfig.url = actualRequestConfig.url.slice( 1 );
		}
		actualRequestConfig.url = self.baseUrl + actualRequestConfig.url;

		/* Add attachment. */
		if ( self.attachment ) {
			if ( self.attachment.name || self.attachment.type ) {
				data.file = {
					value: fs.createReadStream( self.attachment.file ),
					options: {
						filename:    self.attachment.name,
						contentType: self.attachment.type,
					}
				};
			} else {
				data.file = fs.createReadStream( self.attachment.file );
			}
			actualRequestConfig.headers = {
				'Content-MD5': md5( fs.readFileSync( self.attachment.file ) )
			};
			actualRequestConfig.formData = data;
		} else {
			actualRequestConfig.body = data;
		}

		/* Authenticate request. */
		actualRequestConfig = self._auth( actualRequestConfig );

		if ( self.debug ) {
			console.log( '>', actualRequestConfig.method, actualRequestConfig.url );
		}

		self.request( actualRequestConfig, function ( error, response, body ) {
			if ( error ) {
				return callback( error );
			}
			return callback( null, body );
		});
	});
};

/*
 * Private methods.
 */

/**
 * Discovers WP-API base URL from WordPress server.
 *
 * See http://v2.wp-api.org/guide/discovery/
 */
WpApi.prototype._discover = function ( callback ) {
	var self;

	if ( this.baseUrl ) {
		callback();
		return;
	}

	if ( this.debug ) {
		console.log( '> HEAD ' + this.site );
	}

	self = this;
	this.request.head( this.site , function ( error, response ) {
		if ( error ) {
			callback( 'Error when trying to discover WP-API: ' + error );
			return;
		}

		if ( response.statusCode !== 200 ) {
			callback( 'Error when trying to discover WP-API: ' + response.statusCode );
			return;
		}

		/* FIXME Check how the `response.headers` is constructed when the server returns more than a single 'Link' header. */
		if ( ! response.headers.link ) {
			callback( 'Could not find WP-API on the server. Please, make sure it is activated.' );
			return;
		}

		/* FIXME Using regular expression to extract the base URL, there sould be a better way to do this. */
		self.baseUrl = response.headers.link.match( /<([a-zA-Z0-9_\-:\/&?]*)>; rel="https:\/\/github\.com\/WP-API\/WP-API"/ )[1];

		callback();
	});
};

WpApi.prototype._describe = function ( context, callback ) {
	var	self = this,
		url;

	if ( callback === undefined ) {
		callback = context;
		context = null;
	}

	if ( this.wpApi ) {
		callback();
		return;
	}

	if ( context ) {
		url = this.baseUrl + '?' + qs.stringify( { context: context } );
	} else {
		url = this.baseUrl;
	}

	if ( this.debug ) {
		console.log( '> GET ' + url );
	}

	this.request.get( url , function ( error, response, body ) {
		if ( error ) {
			return callback( error );
		}
		if ( response.statusCode !== 200 ) {
			return callback( 'Error when trying to describe WP-API: ' + response.statusCode + '. ' + JSON.stringify( body, null, '  ' ) );
		}

		self.wpApi = body;

		callback();
	});
};

WpApi.prototype._auth = function ( requestConfig ) {
	var	oauthOptions;

	if ( this.oauth ) {
		oauthOptions = urllib.parse( requestConfig.url, true );

		/*
		 * All requests are sent as 'application/json', and OAuth only requires signing bodies of
		 * type 'application/x-www-form-urlencoded'.
		 * If we sign our JSON body, signatures won't match because WP-API/OAuth1 plugin does not
		 * sign the body.
		 * That's why we only sign URL and Method.
		 */
		oauthOptions.url    = requestConfig.url;
		oauthOptions.method = requestConfig.method;

		if ( ! requestConfig.headers ) {
			requestConfig.headers = {};
		}
		requestConfig.headers.Authorization = oauth.makeAuthorizationHeader( this.oauth, oauthOptions );
	} else if ( this.basicAuth ) {
		requestConfig.auth = {
			user: this.basicAuth.user,
			pass: this.basicAuth.pass,
			sendImmediately: true
		};
	}
	return requestConfig;
};

module.exports = WpApi;
