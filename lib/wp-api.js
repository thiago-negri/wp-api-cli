var	request = require( 'request'     ),
	oauth   = require( 'oauth-lite'  ),
	urllib  = require( 'url'         );

/**
 * Interacts with WordPress.org REST API v2.
 */
function WpApi( config ) {
	this.config = config;
	this.site = config.site;
	this.debug = config.debug;
	this.oauth = config.oauth;
	this.request = request.defaults( { json: true } );
}

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
 * Post
 */

WpApi.prototype.listPosts = function ( callback ) {
	this._list( [ 'posts' ], callback );
};

WpApi.prototype.createPost = function ( thePost, callback ) {
	this._create( [ 'posts' ], thePost, callback );
};

WpApi.prototype.updatePost = function ( thePost, callback ) {
	this._update( [ 'posts' ], thePost, callback );
};

WpApi.prototype.getPost = function ( postID, callback ) {
	this._get( [ 'posts' ], postID, callback );
};

WpApi.prototype.deletePost = function ( postID, callback ) {
	this._delete( [ 'posts' ], postID, callback );
};


/*
 * Meta for a Post
 */

WpApi.prototype.listMeta = function ( postID, callback ) {
	this._list( [ 'posts', postID, 'meta' ], callback );
};

WpApi.prototype.createMeta = function ( postID, theMeta, callback ) {
	this._create( [ 'posts', postID, 'meta' ], theMeta, callback );
};

WpApi.prototype.updateMeta = function ( postID, theMeta, callback ) {
	this._update( [ 'posts', postID, 'meta' ], theMeta, callback );
};

WpApi.prototype.getMeta = function ( postID, metaID, callback ) {
	this._get( [ 'posts', postID, 'meta' ], metaID, callback );
};

WpApi.prototype.deleteMeta = function ( postID, metaID, callback ) {
	this._deleteForce( [ 'posts', postID, 'meta' ], metaID, callback );
};

/*
 * Page
 */

WpApi.prototype.listPages = function ( callback ) {
	this._list( [ 'pages' ], callback );
};

WpApi.prototype.createPage = function ( thePage, callback ) {
	this._create( [ 'pages' ], thePage, callback );
};

WpApi.prototype.updatePage = function ( thePage, callback ) {
	this._update( [ 'pages' ], thePage, callback );
};

WpApi.prototype.getPage = function ( pageID, callback ) {
	this._get( [ 'pages' ], pageID, callback );
};

WpApi.prototype.deletePage = function ( pageID, callback ) {
	this._delete( [ 'pages' ], pageID, callback );
};


/*
 * Media
 */

WpApi.prototype.listMedias = function ( callback ) {
	this._list( [ 'media' ], callback );
};

WpApi.prototype.createMedia = function ( theMedia, callback ) {
	this._createFormData( [ 'media' ], theMedia, callback );
};

WpApi.prototype.updateMedia = function ( theMedia, callback ) {
	this._update( [ 'media' ], theMedia, callback );
};

WpApi.prototype.getMedia = function ( mediaID, callback ) {
	this._get( [ 'media' ], mediaID, callback );
};

WpApi.prototype.deleteMedia = function ( mediaID, callback ) {
	this._deleteForce( [ 'media' ], mediaID, callback );
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

WpApi.prototype._describe = function ( callback ) {
	var self = this;

	if ( this.wpApi ) {
		callback();
		return;
	}

	if ( this.debug ) {
		console.log( '> GET ' + this.baseUrl );
	}

	this.request.get( this.baseUrl , function ( error, response, body ) {
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
	} else {
		requestConfig.auth = {
			user: this.config.user,
			pass: this.config.pass,
			sendImmediately: true
		};
	}
	return requestConfig;
};

WpApi.prototype._list = function ( collectionName, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ),
			method: 'GET'
		});

		if ( self.debug ) {
			console.log( '> GET ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 200 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._create = function ( collectionName, theObject, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ),
			method: 'POST',
			body:   theObject
		});

		if ( self.debug ) {
			console.log( '> POST ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 201 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._createFormData = function ( collectionName, theObject, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:      self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ),
			method:   'POST',
			formData: theObject
		});

		if ( self.debug ) {
			console.log( '> POST ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 201 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode + '. ' + JSON.stringify( body ) );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._update = function ( collectionName, theObject, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ) + '/' + encodeURIComponent( theObject.id ),
			method: 'PUT',
			body:   theObject
		});

		if ( self.debug ) {
			console.log( '> PUT ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 200 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._get = function ( collectionName, objectID, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = {
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ) + '/' + encodeURIComponent( objectID ),
			method: 'GET'
		};

		if ( self.debug ) {
			console.log( '> GET ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 200 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._delete = function ( collectionName, objectID, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ) + '/' + encodeURIComponent( objectID ),
			method: 'DELETE'
		});

		if ( self.debug ) {
			console.log( '> DELETE ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 200 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

WpApi.prototype._deleteForce = function ( collectionName, objectID, callback ) {
	var self = this;
	self._discover( function ( error ) {
		var	requestConfig;

		if ( error ) {
			callback( error );
			return;
		}

		requestConfig = self._auth({
			url:    self.baseUrl + 'wp/v2/' + collectionName.map( encodeURIComponent ).join( '/' ) + '/' + encodeURIComponent( objectID ) + '?force=true',
			method: 'DELETE'
		});

		if ( self.debug ) {
			console.log( '> DELETE ' + requestConfig.url );
		}

		self.request( requestConfig, function ( error, response, body ) {
			if ( error ) {
				callback( error );
				return;
			}
			if ( response.statusCode !== 200 ) {
				console.log( body );
				callback( 'Server returned ' + response.statusCode );
				return;
			}
			callback( false, body );
		});
	});
};

module.exports = WpApi;
