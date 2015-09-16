'use strict';

var	request = require( 'request'                    ),
	oauth   = require( 'oauth-lite'                 ),
	urllib  = require( 'url'                        ),
	qs      = require( 'querystring'                ),
	md5     = require( 'md5'                        ),
	fs      = require( 'fs'                         ),
	log     = require( './utils/log'                ),
	basic   = require( 'basic-authorization-header' );

/**
 * Sites without HTTPS are fine.
 */
oauth.requireTLS = false;

/**
 * Interacts with WordPress.org REST API v2.
 *
 * @param r Optional. Request library, used for mocking in tests.
 * @param o Optional. OAuth library, used for mocking in tests.
 */
function WpApi( r, o ) {
	this.request = r || request.defaults( { json: true } );
	this.oauth = o || oauth;

	/* Defaults. */
	this.method = 'GET';
}

/**
 * Sets the URL of site to connect to, e.g. 'https://example.com'.
 *
 * @param site The URL of site to connect to.
 */
WpApi.prototype.setSite = function ( site ) {
	var	oldSite = this.site;
	this.site = site;
	if ( this.baseUrl ) {
		this.baseUrl = site + this.baseUrl.slice( oldSite.length );
	}
	/* We are changing sites, need to fetch API description again. */
	this.wpApi = null;
};

/**
 * Sets the base URL of the API, e.g. 'https://example.com/wp-json/'.
 *
 * @param baseUrl The base URL of the API.
 */
WpApi.prototype.setBaseUrl = function ( baseUrl ) {
	this.baseUrl = baseUrl;
};

/**
 * Sets the API description, this is the JSON returned from a GET on WP-API root.
 *
 * @param description The API description object.
 */
WpApi.prototype.setApiDescription = function ( description ) {
	var	site,
		routes,
		rootRoute,
		baseUrl;

	this.wpApi = description;

	site = description.url;
	if ( site ) {
		this.setSite( site );
	}

	routes = description.routes;
	if ( routes ) {
		rootRoute = routes[ '/' ];
		if ( rootRoute && rootRoute._links ) {
			baseUrl = rootRoute._links.self;
			if ( baseUrl ) {
				this.setBaseUrl( baseUrl );
			}
		}
	}
};

/**
 * Sets which HTTP method to use, e.g. 'GET', 'POST', 'DELETE'.
 *
 * @param method The HTTP method to use.
 */
WpApi.prototype.setMethod = function ( method ) {
	this.method = method;
};

/**
 * Sets OAuth authentication parameters.
 *
 * - oauth_consumer_key
 * - oauth_consumer_secret
 * - oauth_token
 * - oauth_token_secret
 *
 * @param oauthConfig OAuth authentication parameters.
 */
WpApi.prototype.setOAuth = function ( oauthConfig ) {
	this.oauthConfig = oauthConfig;
};

/**
 * Sets HTTP Basic Auth parameters.
 *
 * - user
 * - pass
 *
 * @param authConfig HTTP Basic Auth parameters.
 */
WpApi.prototype.setBasicAuth = function ( authConfig ) {
	this.basicAuth = authConfig;
};

/**
 * Sets an attachment to the request.
 *
 * - file: File name to read from.
 * - name: Name of the file to be saved on server side.
 * - type: Content-Type of the file.
 *
 * @param attachment Attachment configuration.
 */
WpApi.prototype.setAttachment = function ( attachment ) {
	this.attachment = attachment;
};

/**
 * Requests an OAuth Request Token from the API.
 *
 * @param oauthConfig OAuth configuration (consumer key and secret).
 * @param callback    Called with response from server and the authorization URL.
 */
WpApi.prototype.fetchOauthRequestToken = function ( oauthConfig, callback ) {
	var	self = this,
		oauth = this.oauth;

	oauthConfig.oauth_callback = 'oob';

	this._discoverDescribe( function ( error, wpApiDescription ) {
		var	oauthEndpoints,
			requestConfig;

		if ( error ) {
			return callback( error );
		}

		oauthEndpoints = wpApiDescription.authentication.oauth1;

		requestConfig = {
			method: 'POST',
			url: oauthEndpoints.request,
			headers: {}
		};
		requestConfig.headers.Authorization = self._oauthHeader( requestConfig, oauthConfig );

		log.request( requestConfig );

		self.request( requestConfig, function ( error, response, body ) {
			var	bodyObj,
				queryString;

			if ( error ) {
				return callback( error );
			}

			log.response( response );

			if ( response.statusCode !== 200 ) {
				return callback( 'Something went wrong.' );
			}

			bodyObj = qs.parse( body );

			queryString = '?oauth_token=' + encodeURIComponent( bodyObj.oauth_token );
			bodyObj.authorizeUrl = oauthEndpoints.authorize + queryString;

			return callback( null, bodyObj );
		});
	});
};

/**
 * Requests an OAuth Access Token from the API.
 *
 * @param oauthConfig OAuth configuration (consumer key, consumer secret, token, token secret).
 * @param callback    Called with response from server.
 */
WpApi.prototype.fetchOauthAccessToken = function ( oauthConfig, callback ) {
	var	self = this;
	this._discoverDescribe( function ( error, wpApiDescription ) {
		var	requestConfig;

		if ( error ) {
			return callback( error );
		}

		requestConfig = {
			method: 'POST',
			url: wpApiDescription.authentication.oauth1.access,
			headers: {}
		};
		requestConfig.headers.Authorization = self._oauthHeader( requestConfig, oauthConfig );

		log.request( requestConfig );

		self.request( requestConfig, function ( error, response, body ) {
			var	bodyObj;

			if ( error ) {
				return callback( error );
			}

			log.response( response );

			if ( response.statusCode !== 200 ) {
				return callback( 'Something went wrong.' );
			}

			bodyObj = qs.parse( body );

			callback( null, bodyObj );
		});
	});
};

/**
 * Describes the API.
 *
 * @param callback Called with API description.
 */
WpApi.prototype.describe = function ( callback ) {
	this._discoverDescribe( 'help', callback );
};

/**
 * Performs the configured request.
 *
 * @param requestConfig Additional request configuration (url, body).
 * @param callback      Called with server response.
 */
WpApi.prototype.doRequest = function ( requestConfig, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	data = requestConfig.body,
			actualRequestConfig = {
				method: self.method,
				url: requestConfig.url,
			},
			key;

		if ( error ) {
			return callback( error );
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
		} else if ( data ) {
			actualRequestConfig.body = data;
		}

		/* Authenticate request. */
		actualRequestConfig = self._auth( actualRequestConfig );

		/* Generate log message. */
		log.request( actualRequestConfig );

		self.request( actualRequestConfig, callback );
	});
};

/*
 * Private methods.
 */

/**
 * Discovers WP-API base URL from WordPress server.
 *
 * See http://v2.wp-api.org/guide/discovery/
 *
 * @param callback Called after resolving. If no error is set, then 'WpApi.baseUrl' contains the base URL.
 */
WpApi.prototype._discover = function ( callback ) {
	var	self,
		requestConfig;

	if ( this.baseUrl ) {
		return callback();
	}

	requestConfig = {
		method: 'HEAD',
		url: this.site,
	};

	log.request( requestConfig );

	self = this;
	this.request( requestConfig , function ( error, response ) {
		var	regexMatch;

		if ( error ) {
			return callback( 'Error when trying to discover WP-API: ' + error );
		}

		log.response( response );

		if ( response.statusCode !== 200 ) {
			return callback( 'Error when trying to discover WP-API: ' + response.statusCode );
		}

		if ( ! response.headers.link ) {
			return callback( 'Could not find WP-API on the server. Please, make sure it is activated.' );
		}

		/* FIXME Using regular expression to extract the base URL, there sould be a better way to do this. */
		regexMatch = response.headers.link.match( /<([a-zA-Z0-9_\-:\/&?\.]*)>; rel="https:\/\/github\.com\/WP-API\/WP-API"/ );
		if ( ! regexMatch || regexMatch.length < 1 ) {
			return callback( 'Could not find WP-API on the server. Please, make sure it is activated.' );
		}
		self.baseUrl = regexMatch[1];

		return callback();
	});
};

/**
 * Describes the WP-API
 *
 * @param context  Optional. Context to use for the description, use 'help' to get a more human response.
 * @param callback Called after describing. If no error is set, then 'WpApi.wpApi' contains the API description.
 */
WpApi.prototype._describe = function ( context, callback ) {
	var	self = this,
		url,
		requestConfig;

	if ( callback === undefined ) {
		callback = context;
		context = null;
	}

	if ( this.wpApi ) {
		return callback();
	}

	if ( context ) {
		url = this.baseUrl + '?' + qs.stringify( { context: context } );
	} else {
		url = this.baseUrl;
	}

	requestConfig = {
		method: 'GET',
		url: url,
	};

	log.request( requestConfig );

	this.request( requestConfig , function ( error, response, body ) {
		if ( error ) {
			return callback( error );
		}

		log.response( response );

		if ( response.statusCode !== 200 ) {
			return callback( 'Error when trying to describe WP-API: ' + response.statusCode + '. ' + JSON.stringify( body, null, '  ' ) );
		}

		self.wpApi = body;

		return callback();
	});
};

/**
 * Sequences calls '_discover' and '_describe'.
 *
 * @param describeContext Context param for API description.
 * @param callback Called after '_discover' and '_describe'.
 */
WpApi.prototype._discoverDescribe = function ( describeContext, callback ) {
	var self = this;
	if ( ! callback ) {
		callback = describeContext;
		describeContext = null;
	}
	self._discover( function ( error ) {
		if ( error ) {
			return callback( error );
		}
		self._describe( describeContext, function ( error ) {
			if ( error ) {
				return callback( error );
			}
			return callback( null, self.wpApi );
		});
	});
};

/**
 * Authenticates a request.
 *
 * The request configuration is changed in place.
 *
 * @param requestConfig Request configuration.
 * @return Updated request configuration.
 */
WpApi.prototype._auth = function ( requestConfig ) {
	if ( this.oauthConfig ) {
		if ( ! requestConfig.headers ) {
			requestConfig.headers = {};
		}
		requestConfig.headers.Authorization = this._oauthHeader( requestConfig, this.oauthConfig );
	} else if ( this.basicAuth ) {
		if ( ! requestConfig.headers ) {
			requestConfig.headers = {};
		}
		requestConfig.headers.Authorization = basic( this.basicAuth.user, this.basicAuth.pass );
	}
	return requestConfig;
};

/**
 * Creates an OAuth Authorization header.
 *
 * @param requestConfig The request config object.
 * @param oauthConfig The OAuth parameters.
 * @return The OAuth Authorization header.
 */
WpApi.prototype._oauthHeader = function ( requestConfig, oauthConfig ) {
    var	oauthOptions = urllib.parse( requestConfig.url, true );

	/*
	 * All requests are sent as 'application/json', and OAuth only requires signing bodies of
	 * type 'application/x-www-form-urlencoded'.
	 * If we sign our JSON body, signatures won't match because WP-API/OAuth1 plugin does not
	 * sign the body.
	 * That's why we only sign URL and Method.
	 */
	oauthOptions.url    = requestConfig.url;
	oauthOptions.method = requestConfig.method;

	return this.oauth.makeAuthorizationHeader( oauthConfig, oauthOptions );
};

module.exports = WpApi;
