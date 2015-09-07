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
	init: function ( context, cli, args, options, api, callback ) {
		var	toReplace = [];

		find.prefix( options, 'dict:', function ( key, value ) {
			toReplace.push({
				key   : key,
				value : value,
			});
		});

		toReplace.forEach( function ( entry ) {
			options[ entry.key ] = qs.parse( entry.value );
		});

		return callback();
	},
};