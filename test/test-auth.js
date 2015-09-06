'use-strict';

var	fs    = require( 'fs' ),
	cli   = require( '../lib/wp-api-cli' ),
	WpApi = require( '../lib/wp-api' );

module.exports[ 'authenticate' ] = {

	'request': function ( test ) {
		var	self = this,
			fakeDescription = {
				authentication: {
					oauth1: {
						request: 'https://example.com/oauth1/request',
						authorize: 'https://example.com/oauth1/authorize',
						access: 'https://example.com/oauth1/access',
					},
				},
			};

		test.expect( 4 );

		self.request = {};

		self.request.get = function ( url, callback ) {
			if ( url === 'https://example.com/wp-json/' ) {
				return callback( null, { statusCode: 200 }, fakeDescription );
			}
			test.ok( false, 'unexpected get request: ' + url );
			return callback( 'unexpected get request: ' + url );
		};

		self.request.head = function ( url, callback ) {
			if ( url === 'https://example.com' ) {
				return callback( null, {
					statusCode: 200,
					headers: {
						link: '<https://example.com/wp-json/>; rel="https://github.com/WP-API/WP-API"',
					},
				}, '' );
			}
			test.ok( false, 'unexpected head request: ' + url );
			return callback( 'unexpected head request: ' + url );
		};

		self.oauth = {};

		self.oauth.fetchRequestToken = function ( oauthConfig, url, form, callback ) {
			test.equal( url, 'https://example.com/oauth1/request' );
			test.equal( form, null );
			test.deepEqual( oauthConfig, {
				oauth_consumer_key: 'foo',
				oauth_consumer_secret: 'bar',
				oauth_callback: 'oob',
			});
			return callback( null, { oauth_token: 'spam' } );
		};

		self.wpApi = new WpApi( self.request, self.oauth );
		self.wpApi.setSite( 'https://example.com' );

		self.oauthConfig = {
			oauth_consumer_key: 'foo',
			oauth_consumer_secret: 'bar',
		};

		self.wpApi.fetchOauthRequestToken( self.oauthConfig, function ( error, response ) {
			test.deepEqual( response, {
				oauth_token: 'spam',
				authorizeUrl: 'https://example.com/oauth1/authorize?oauth_token=spam',
			});
			test.done();
		});
	},

	'access': function ( test ) {
		var	self = this,
			fakeDescription = {
				authentication: {
					oauth1: {
						request: 'https://example.com/oauth1/request',
						authorize: 'https://example.com/oauth1/authorize',
						access: 'https://example.com/oauth1/access',
					},
				},
			};

		test.expect( 4 );

		self.request = {};

		self.request.get = function ( url, callback ) {
			if ( url === 'https://example.com/wp-json/' ) {
				return callback( null, { statusCode: 200 }, fakeDescription );
			}
			test.ok( false, 'unexpected get request: ' + url );
			return callback( 'unexpected get request: ' + url );
		};

		self.request.head = function ( url, callback ) {
			if ( url === 'https://example.com' ) {
				return callback( null, {
					statusCode: 200,
					headers: {
						link: '<https://example.com/wp-json/>; rel="https://github.com/WP-API/WP-API"',
					},
				}, '' );
			}
			test.ok( false, 'unexpected head request: ' + url );
			return callback( 'unexpected head request: ' + url );
		};

		self.oauth = {};

		self.oauth.fetchAccessToken = function ( oauthConfig, url, form, callback ) {
			test.equal( url, 'https://example.com/oauth1/access' );
			test.equal( form, null );
			test.equal( oauthConfig, 'fake-oauth-config' );
			return callback( null, 'fake-oauth-response' );
		};

		self.wpApi = new WpApi( self.request, self.oauth );
		self.wpApi.setSite( 'https://example.com' );

		self.oauthConfig = 'fake-oauth-config';

		self.wpApi.fetchOauthAccessToken( self.oauthConfig, function ( error, response ) {
			test.equal( response, 'fake-oauth-response' );
			test.done();
		});
	}

};