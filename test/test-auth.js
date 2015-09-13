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

		test.expect( 8 );

		self.request = function ( options, callback ) {
			var	url = options.url,
				method = options.method;
			if ( method === 'GET' ) {
				test.equal( url, 'https://example.com/wp-json/' );
				return callback( null, { statusCode: 200 }, fakeDescription );
			}
			if ( method === 'HEAD' ) {
				test.equal( url, 'https://example.com' );
				return callback( null, {
					statusCode: 200,
					headers: {
						link: '<https://example.com/wp-json/>; rel="https://github.com/WP-API/WP-API"',
					},
				}, '' );
			}
			if ( method === 'POST' ) {
				test.equal( url, 'https://example.com/oauth1/request' );
				test.equal( options.headers.Authorization, 'OAuthFakeAuthorizationHeader' );
				return callback( null, { statusCode: 200 }, 'oauth_token=OAuthFakeToken' );
			}
			test.ok( false, 'Unexpected request.' );
		};

		self.oauth = {
			makeAuthorizationHeader: function( oauthConfig, oauthOptions ) {
				test.equal( oauthOptions.method, 'POST' );
				test.equal( oauthOptions.url, 'https://example.com/oauth1/request' );
				test.deepEqual( oauthConfig, {
					oauth_consumer_key: 'foo',
					oauth_consumer_secret: 'bar',
					oauth_callback: 'oob',
				});
				return 'OAuthFakeAuthorizationHeader';
			},
		};

		self.wpApi = new WpApi( self.request, self.oauth );
		self.wpApi.setSite( 'https://example.com' );

		self.oauthConfig = {
			oauth_consumer_key: 'foo',
			oauth_consumer_secret: 'bar',
		};

		self.wpApi.fetchOauthRequestToken( self.oauthConfig, function ( error, response ) {
			test.deepEqual( response, {
				oauth_token: 'OAuthFakeToken',
				authorizeUrl: 'https://example.com/oauth1/authorize?oauth_token=OAuthFakeToken',
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

		test.expect( 8 );

		self.request = function ( options, callback ) {
			var	url = options.url,
				method = options.method;
			if ( method === 'GET' ) {
				test.equal( url, 'https://example.com/wp-json/' );
				return callback( null, { statusCode: 200 }, fakeDescription );
			}
			if ( method === 'HEAD' ) {
				test.equal( url, 'https://example.com' );
				return callback( null, {
					statusCode: 200,
					headers: {
						link: '<https://example.com/wp-json/>; rel="https://github.com/WP-API/WP-API"',
					},
				}, '' );
			}
			if ( method === 'POST' ) {
				test.equal( url, 'https://example.com/oauth1/access' );
				test.equal( options.headers.Authorization, 'OAuthFakeAuthorizationHeader' );
				return callback( null, { statusCode: 200 }, 'oauth_fake=FakeOAuthResponse' );
			}
			test.ok( false, 'Unexpected request.' );
		};

		self.oauth = {};

		self.oauth = {
			makeAuthorizationHeader: function( oauthConfig, oauthOptions ) {
				test.equal( oauthOptions.method, 'POST' );
				test.equal( oauthOptions.url, 'https://example.com/oauth1/access' );
				test.equal( oauthConfig, 'fake-oauth-config' );
				return 'OAuthFakeAuthorizationHeader';
			},
		};

		self.wpApi = new WpApi( self.request, self.oauth );
		self.wpApi.setSite( 'https://example.com' );

		self.oauthConfig = 'fake-oauth-config';

		self.wpApi.fetchOauthAccessToken( self.oauthConfig, function ( error, response ) {
			test.deepEqual( response, { oauth_fake: 'FakeOAuthResponse' } );
			test.done();
		});
	}

};