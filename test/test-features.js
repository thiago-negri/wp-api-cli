'use-strict';

var	fs    = require( 'fs' ),
	cli   = require( '../lib/wp-api-cli' ),
	WpApi = require( '../lib/wp-api' );

/**
 * Instantiates WpApi class with mock request.
 *
 * To assert the request received by WpApi, wire a callback function on `this.requestConfigCallback`.
 */
function setUp() {
	return function ( next ) {
		var	self = this;

		this.context = {
			oauthFile: __dirname + '/test-oauth-this-does-not-exists.json',
			apiDescriptionFile: __dirname + '/test-api.json',
		};

		this.request = function ( config, callback ) {
			self.requestConfigCallback( config );
			return callback( null, { statusCode: 200 }, '' );
		};

		this.wpApi = new WpApi( this.request );

		return next();
	};
}

/**
 * Executes the CLI and assert that it attempts a request to WP-API.
 *
 * @param args The command line arguments for the CLI.
 * @param expectedRequest The expected request that the CLI should make.
 */
function testRequest( args, expectedRequest, flattenFile ) {
	return function ( test ) {
		test.expect( 1 );

		this.requestConfigCallback = function ( actual ) {
			/* OAuth signature is based on a random nonce, it changes with every test */
			if ( actual.headers && actual.headers.Authorization && actual.headers.Authorization.indexOf( 'OAuth' ) === 0 ) {
				actual.headers.Authorization = 'OAuth ...';
			}
			if ( flattenFile ) {
				if ( actual.formData.file.value ) {
					actual.formData.file.value = '(FileHandler)' + actual.formData.file.value.path;
				} else {
					actual.formData.file = '(FileHandler)' + actual.formData.file.path;
				}
			}
			test.deepEqual( actual, expectedRequest );
			test.done();
		};

		if ( typeof args === 'string' ) {
			args = 'wp-api-cli ' + args;
		} else /* array */ {
			args.unshift( 'wp-api-cli' );
		}

		cli.main( args, this.context, this.wpApi );
	};
}

module.exports[ 'features' ] = {

	setUp: setUp(),

	'path resolution A': testRequest( 'path_a', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a',
	}),

	'path resolution B': testRequest( 'path_a_path_b', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a/path_b',
	}),

	'path resolution A with path param': testRequest( 'path_a --path_param_a FOO', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a/FOO',
	}),

	'path A with query': testRequest( 'path_a --query_param_a BAR --query_param_b BAZ', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a?query_param_a=BAR&query_param_b=BAZ',
	}),

	'path A ignore body param': testRequest( 'path_a --body_param_a foo --body_param_b zupt', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a',
	}),

	'query from file': testRequest( 'path_a --query_param_a file:test-file.txt', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a?query_param_a=FooBarBaz',
	}),

	'body from file': testRequest( 'path_a -X POST --body_param_a file:test-file.txt', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		body: {
			body_param_a: 'FooBarBaz',
		},
	}),

	'query from dict': testRequest( 'path_a --query_param_a dict:a=b&c=d', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a?query_param_a[a]=b&query_param_a[c]=d',
	}),

	'body from dict': testRequest( 'path_a -X POST --body_param_a dict:a=b&c=d', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		body: {
			body_param_a: {
				a: 'b',
				c: 'd',
			},
		},
	}),

	'body from boolean': testRequest( 'path_a -X POST --body_param_a true', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		body: {
			body_param_a: true,
		},
	}),

	'body from boolean text': testRequest( 'path_a -X POST --body_param_a text:true', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		body: {
			body_param_a: 'true',
		},
	}),

	'overwrite site': testRequest( 'path_a --site https://mysite.com', {
		method: 'GET',
		url: 'https://mysite.com/wp-json/path_a',
	}),

	'attachment': testRequest( 'path_a -X POST --attachment test-file.txt', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		headers: {
			'Content-MD5': 'c237987d551ea1a5770c2c1b1dd61831' 
		},
		formData: { 
			file: '(FileHandler)test-file.txt',
    	}
	}, true ),

	'attachment meta': testRequest( 'path_a -X POST --attachment test-file.txt --attachment_name MyFile.txt --attachment_type text/html', {
		method: 'POST',
		url: 'https://example.com/wp-json/path_a',
		headers: {
			'Content-MD5': 'c237987d551ea1a5770c2c1b1dd61831' 
		},
		formData: { 
			file: {
				value: '(FileHandler)test-file.txt',
				options: {
					filename: 'MyFile.txt',
					contentType: 'text/html',
				}
			},
    	}
	}, true ),

	'secure connection': function ( test ) {
		test.expect( 1 );

		this.requestConfigCallback = function () {
			test.equals( process.env.NODE_TLS_REJECT_UNAUTHORIZED, '1' );
			test.done();
		};

		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		cli.main( 'wp-api-cli path_a', this.context, this.wpApi );
	},

	'insecure connection': function ( test ) {
		test.expect( 1 );

		this.requestConfigCallback = function () {
			test.equals( process.env.NODE_TLS_REJECT_UNAUTHORIZED, '0' );
			test.done();
		};
		
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
		cli.main( 'wp-api-cli path_a -k', this.context, this.wpApi );
	},

	'oauth load': testRequest( 'path_a --oauth_file test-oauth.json', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a',
		headers: {
			Authorization: 'OAuth ...',
		},
	}),

	'basic auth': testRequest( 'path_a --http_user foo --http_pass bar', {
		method: 'GET',
		url: 'https://example.com/wp-json/path_a',
		auth: {
			user: 'foo',
			pass: 'bar',
			sendImmediately: true,
		},
	}),

};
