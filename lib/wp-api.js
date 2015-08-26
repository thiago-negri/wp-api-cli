var	request = require( 'request'     ),
	oauth   = require( 'oauth-lite'  ),
	urllib  = require( 'url'         ),
	qs      = require( 'querystring' );

/**
 * Interacts with WordPress.org REST API v2.
 */
function WpApi() {
	this.request = request.defaults( { json: true } );
}

WpApi.prototype.setSite = function ( site ) {
	this.site = site;
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
		if ( error ) {
			callback( error );
			return;
		}
		if ( requestConfig.url[0] === '/' ) {
			requestConfig.url = requestConfig.url.slice( 1 );
		}
		requestConfig.url = self.baseUrl + requestConfig.url;
		if ( self.debug ) {
			console.log( '>', requestConfig.method, requestConfig.url );
		}
		self.request( self._auth( requestConfig ), function ( error, response, body ) {
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
	this.request.head( this.site , function ( error, response, body ) {
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
		self.baseUrl = response.headers.link.match( /.*<([^>]*)>; rel="https:\/\/github.com\/WP-API\/WP-API"/ )[1];

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

	if ( this.debug ) {
		console.log( '> GET ' + this.baseUrl );
	}

	if ( context ) {
		url = this.baseUrl + '?' + qs.stringify( { context: context } );
	} else {
		url = this.baseUrl;
	}

	this.request.get( url , function ( error, response, body ) {
		if ( error || response.statusCode !== 200 ) {
			callback( 'Error when trying to describe WP-API: ' + response.statusCode + ' ' + error );
			return;
		}

		self.wpApi = body;

		callback();
	});
};

WpApi.prototype._auth = function ( requestConfig ) {
	if ( this.oauth ) {
		oauthOptions = urllib.parse( requestConfig.url );

		oauthOptions.url    = requestConfig.url;
		oauthOptions.method = requestConfig.method;
		oauthOptions.data   = requestConfig.body || requestConfig.formData;

		requestConfig.headers = {
			Authorization: oauth.makeAuthorizationHeader( this.oauth, oauthOptions )
		};
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
