'use-strict';

var	fs    = require( 'fs' ),
	cli   = require( '../lib/wp-api-cli' ),
	WpApi = require( '../lib/wp-api' );

module.exports[ 'update' ] = function ( test ) {
	var	fakeDescription = { url: 'foo' },
		self = this;

	test.expect( 4 );

	self.context = {
		oauthFile: __dirname + '/test-oauth.json',
		apiDescriptionFile: __dirname + '/this-file-does-not-exists.json',
	};

	fs.unlink( this.context.apiDescriptionFile, function ( error ) {
		if ( error && error.code !== 'ENOENT' ) {
			test.ifError( error );
		}

		self.request = function ( options, callback ) {
			var	url = options.url,
				method = options.method;
			if ( method === 'GET' ) {
				test.equal( url, 'https://example.com/wp-json/?context=help' );
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
		};

		self.wpApi = new WpApi( self.request );

		cli.main( 'wp-api-cli update https://example.com', self.context, self.wpApi, function () {
			fs.readFile( self.context.apiDescriptionFile, 'utf8', function ( error, content ) {
				test.ifError( error );
				test.deepEqual( JSON.parse( content ), fakeDescription );
				fs.unlink( self.context.apiDescriptionFile, function () {
					test.done();
				});
			});
		});

	});
};
