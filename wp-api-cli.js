#!/usr/bin/env node

/* FIXME Change 'context' to an object (prototype). */

var	fs    = require( 'fs'           ),
	cli   = require( 'cli'          ),
	WpApi = require( './lib/wp-api' );

/*
 * Do not give an error when using self-signed certificate for HTTPS
 *
 * TODO Change this to an option
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

cli.setUsage( 'wp-api-cli [OPTIONS] <COMMAND>' );

cli.option_width = 30;

cli.parse({
	site:  [ 's', '(Required) Set base URL to use', 'STRING' ],
	debug: [ 'd', 'Turns on debugging mode, will output interactions with server' ],

	/* HTTP Basic-Auth */
	user: [ 'u', 'Set username to use for HTTP Basic Authentication', 'STRING' ],
	pass: [ 'p', 'Set password to use for HTTP Basic Authentication', 'STRING' ],

	/* Post */
	post_type:    [ false, 'Post type to be created or updated', 'STRING', 'post' ],
	post_title:   [ false, 'Post title to be created or updated', 'STRING', '' ],
	post_content: [ false, 'Content of post to be created or updated', 'STRING' ],
	post_file:    [ false, 'Content of FILE will be used as content of post', 'FILE' ]
}, {
	post_list:   'List all published posts',
	post_create: 'Creates a new post'
});

cli.main( function ( args, options ) {
	var	config,
		wpApi;

	validateAndSanitize( options );

	config = {
		site:  options.site,
		user:  options.user,
		pass:  options.pass,
		debug: options.debug
	};

	wpApi = new WpApi( config );

	switch ( cli.command ) {
		case 'post_list':
			wpApi.listPosts( function ( error, data ) {
				if ( error ) {
					cli.fatal( error );
				}
				console.log( data );
			});
			break;

		case 'post_create':
			createPost( args, options );
			break;
	}
});

/**
 * Validate and sanitize user input.
 */
function validateAndSanitize( options ) {
	if ( ! options.site ) {
		cli.fatal( 'Missing base URL. Please, set a base URL by using `-s` or `--site`.' );
	}

	if ( ! options.user || ! options.pass ) {
		cli.fatal( 'Please, set a username (`-u`) and password (`-p`) to use for HTTP Basic Authentication.' );
	}

	if ( options.site[-1] !== '/' ) {
		options.site = options.site + '/';
	}
}

function createPost( args, options ) {
	var fileName = options.post_file,
		thePost = {
			type:  options.post_type,
			title: options.post_title
		};

	if ( fileName ) {
		fs.readFile( fileName, 'utf8', function ( error, data ) {
			if ( error ) {
				cli.fatal( 'Error while loading post content from file ' + fileName + ': ' + error );
			}
			thePost.content = data;
			wpApi.createPost( thePost, callback );
		});
	} else if ( options.post_content ) {
		thePost.content = options.post_content;
		wpApi.createPost( thePost, callback );
	} else {
		cli.withStdin( function ( stdin ) {
			thePost.content = stdin;
			wpApi.createPost( thePost, callback );
		});
	}
}
