'use strict';

/**
 * Finds all options with a common prefix.
 *
 * @param options  Options object.
 * @param prefix   Prefix string to search, e.g. 'file:'.
 * @param callback Called for every option found with prefix, args: option
 *                 name and option value without prefix.
 */
function findPrefix( options, prefix, callback ) {
	var	key,
		value,
		actualValue,
		prefixLength = prefix.length;

	for ( key in options ) {
		if ( options.hasOwnProperty( key ) ) {
			value = options[ key ];
			if ( value && typeof value === 'string' ) {
				if ( value.slice( 0, prefixLength ) === prefix ) {
					actualValue = value.slice( prefixLength );
					callback( key, actualValue );
				}
			}
		}
	}
}

/**
 * Finds all options that are objects.
 *
 * @param options  Options object.
 * @param callback Called for every option found, args: option name and option
 *                 value.
 */
function findObjects( options, callback ) {
	var	key,
		value;

	for ( key in options ) {
		if ( options.hasOwnProperty( key ) ) {
			value = options[ key ];
			if ( value && typeof value === 'object' ) {
				callback( key, value );
			}
		}
	}
}

module.exports = {
	prefix  : findPrefix,
	objects : findObjects,
};
