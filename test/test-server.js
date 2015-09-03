'use-strict';

var	fs    = require( 'fs' ),
	cli   = require( '../lib/wp-api-cli' ),
	WpApi = require( '../lib/wp-api' );

function assertRequest( test, expected ) {
	return function ( actual ) {
		test.deepEqual( actual, expected );
		test.done();
	};
}

module.exports[ 'posts' ] = {

	setUp: function ( next ) {
		var	self = this;

		this.context = {
			oauthFile: __dirname + '/oauth.json',
			apiDescriptionFile: __dirname + '/test-api.json',
		};

		this.request = function ( config, callback ) {
			self.callback( config );
			return callback( null, { statusCode: 200 }, '' );
		};

		this.wpApi = new WpApi( this.request );

		return next();
	},

	'list': function ( test ) {
		test.expect( 1 );

		this.callback = assertRequest( test, {
			method: 'GET',
			url: 'http://localhost/trunk/wp-json/wp/v2/posts',
			body: undefined,
		});

		cli.main( 'node wp-api-cli posts', this.context, this.wpApi );
	},

	'read': function ( test ) {
		test.expect( 1 );

		this.callback = assertRequest( test, {
			method: 'GET',
			url: 'http://localhost/trunk/wp-json/wp/v2/posts/3',
			body: undefined,
		});

		cli.main( 'node wp-api-cli posts --id 3', this.context, this.wpApi );
	},

	'create': function ( test ) {
		test.expect( 1 );

		this.callback = assertRequest( test, {
			method: 'POST',
			url: 'http://localhost/trunk/wp-json/wp/v2/posts',
			body: {
				content: 'foo',
				title: 'bar',
			},
		});

		cli.main( 'node wp-api-cli posts -X POST --content foo --title bar', this.context, this.wpApi );
	},

	'trash': function ( test ) {
		test.expect( 1 );

		this.callback = assertRequest( test, {
			method: 'DELETE',
			url: 'http://localhost/trunk/wp-json/wp/v2/posts/5',
			body: undefined,
		});

		cli.main( 'node wp-api-cli posts -X DELETE --id 5', this.context, this.wpApi );
	},

	'delete': function ( test ) {
		test.expect( 1 );

		this.callback = assertRequest( test, {
			method: 'DELETE',
			url: 'http://localhost/trunk/wp-json/wp/v2/posts/5?force=true',
			body: undefined,
		});

		cli.main( 'node wp-api-cli posts -X DELETE --id 5 --force true', this.context, this.wpApi );
	},

};
