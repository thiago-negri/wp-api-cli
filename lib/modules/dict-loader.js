'use strict';

/**
 * Transforms options into objects.
 *
 * Each option prefixed with 'dict:' will be transformed into an object.
 */

var	find = require( '../utils/find' );

/**
 * Transforms a dictionary into an object.
 *
 * The string 'a=1&b&c=foo' results in `{ a: 1, b: null, c: 'foo' }`.
 *
 * It's a very naive implementation, doesn't support escaping.
 */
function dictToObject( dict ) {
	var	parts,
		splitPart,
		key,
		value,
		i,
		len,
		result;

	result = {};

	parts = dict.split( '&' );
	for ( i = 0, len = parts.length; i < len; i += 1 ) {
		splitPart = parts[ i ].split( '=' );

		key   = splitPart[ 0 ];
		value = ( 1 < splitPart.length ? splitPart[ 1 ] : null );

		result[ key ] = value;
	}

	return result;
}

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
			options[ entry.key ] = dictToObject( entry.value );
		});

		callback();
	},
};
