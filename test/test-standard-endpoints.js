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
			oauthFile: __dirname + '/standard-oauth.json',
			apiDescriptionFile: __dirname + '/standard-api.json',
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
function testRequest( args, expectedRequest ) {
	return function ( test ) {
		test.expect( 1 );

		this.requestConfigCallback = function ( actual ) {
			test.deepEqual( actual, expectedRequest );
			test.done();
		};

		if ( typeof args === 'string' ) {
			args = 'wp-api-cli ' + args;
		} else /* array */ {
			args.unshift( 'wp-api-cli' );
		}

		cli.main( args , this.context, this.wpApi );
	};
}

/**
 * Test CLI command 'posts'.
 *
 * Endpoints:
 * - /wp/v2/posts
 * - /wp/v2/posts/(?P<id>[\\d]+)
 */
module.exports[ 'posts' ] = {

	setUp: setUp(),

	'list': testRequest( 'posts', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts',
	}),

	'paged list': testRequest( 'posts --page 1 --per_page 30 --context view', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts?context=view&page=1&per_page=30',
	}),

	'search': testRequest( 'posts --filter dict:s=foo', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts?filter[s]=foo',
	}),

	'read': testRequest( 'posts --id 3', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3',
	}),

	'create': testRequest( 'posts -X POST --content file:test-file.txt --title bar', {
		method: 'POST',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts',
		body: {
			content: 'FooBarBaz',
			title: 'bar',
		},
	}),

	'update': testRequest( 'posts -X PUT --id 3 --comment_status closed', {
		method: 'PUT',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3',
		body: {
			comment_status: 'closed',
		},
	}),

	'trash': testRequest( 'posts -X DELETE --id 5', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/5',
	}),

	'delete': testRequest( 'posts -X DELETE --id 5 --force true', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/5?force=true',
	}),

};

/**
 * Test CLI command 'posts_meta'.
 *
 * Endpoints:
 * - /wp/v2/posts/(?P<parent_id>[\\d]+)/meta
 * - /wp/v2/posts/(?P<parent_id>[\\d]+)/meta/(?P<id>[\\d]+)
 */
module.exports[ 'posts_meta' ] = {

	setUp: setUp(),

	'list': testRequest( 'posts_meta --parent_id 1', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/meta',
	}),

	'read': testRequest( 'posts_meta --parent_id 1 --id 3', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/meta/3',
	}),

	'create': testRequest( [ 'posts_meta', '--parent_id', '1', '-X', 'POST', '--key', 'Listening To', '--value', 'Silence' ], {
		method: 'POST',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/meta',
		body: {
			key: 'Listening To',
			value: 'Silence',
		},
	}),

	'update': testRequest( 'posts_meta -X PUT --parent_id 1 --id 3 --value Nature', {
		method: 'PUT',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/meta/3',
		body: {
			value: 'Nature',
		},
	}),

	'trash': testRequest( 'posts_meta -X DELETE --parent_id 3 --id 5', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3/meta/5',
	}),

	'delete': testRequest( 'posts_meta -X DELETE --parent_id 3 --id 5 --force true', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3/meta/5?force=true',
	}),

};

/**
 * Test CLI command 'posts_revisions'.
 *
 * Endpoints:
 * - /wp/v2/posts/(?P<parent_id>[\\d]+)/revisions
 * - /wp/v2/posts/(?P<parent_id>[\\d]+)/revisions/(?P<id>[\\d]+)
 */
module.exports[ 'posts_revisions' ] = {

	setUp: setUp(),

	'list': testRequest( 'posts_revisions --parent_id 1', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/revisions',
	}),

	'list with context': testRequest( 'posts_revisions --parent_id 1 --context embed', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/revisions?context=embed',
	}),

	'read': testRequest( 'posts_revisions --parent_id 1 --id 3', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/revisions/3',
	}),

	'read with context': testRequest( 'posts_revisions --parent_id 1 --id 3 --context embed', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/revisions/3?context=embed',
	}),

	'trash': testRequest( 'posts_revisions -X DELETE --parent_id 3 --id 5', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3/revisions/5',
	}),

};

/**
 * Test CLI command 'posts_terms_category'.
 *
 * Endpoints:
 * - /wp/v2/posts/(?P<post_id>[\\d]+)/terms/category
 * - /wp/v2/posts/(?P<post_id>[\\d]+)/terms/category/(?P<term_id>[\\d]+)
 */
module.exports[ 'posts_terms_category' ] = {

	setUp: setUp(),

	'list': testRequest( 'posts_terms_category --post_id 1', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/1/terms/category',
	}),

	'ordered list': testRequest( 'posts_terms_category --post_id 2 --order desc --orderby name', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/2/terms/category?order=desc&orderby=name',
	}),

	'read': testRequest( 'posts_terms_category --post_id 3 --term_id 4', {
		method: 'GET',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/3/terms/category/4',
	}),

	'create': testRequest( 'posts_terms_category --post_id 5 --term_id 6 -X POST', {
		method: 'POST',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/5/terms/category/6',
		body: {},
	}),

	'trash': testRequest( 'posts_terms_category --post_id 7 --term_id 8 -X DELETE', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/7/terms/category/8',
	}),

	'delete': testRequest( 'posts_terms_category --post_id 7 --term_id 8 -X DELETE --force true', {
		method: 'DELETE',
		url: 'http://localhost/trunk/wp-json/wp/v2/posts/7/terms/category/8?force=true',
	}),

};