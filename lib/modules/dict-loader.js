'use strict';

/**
 * Transforms options into objects.
 *
 * Each option prefixed with 'dict:' will be parsed as a query string and
 * transformed into an object.
 */

var	qs   = require( 'querystring'   ),
	find = require( '../utils/find' );

module.exports = {
	init: function ( context, api, options, callback ) {
		[ options, options.parent ].forEach( function ( e ) {
			find.prefix( e, 'dict:', function ( key, value ) {
				e[ key ] = qs.parse( value );
			});
		});

		return callback();
	},
};