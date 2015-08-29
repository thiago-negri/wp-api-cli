'use strict';

/**
 * Converts all options that looks like a bool into a bool.
 *
 * User can use 'text:true' if it does not want this conversion.
 */

module.exports = {
	init: function ( cli, args, options, api, callback ) {
		var	key,
			value;

		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				value = options[ key ];
				if ( 'true' === value ) {
					options[ key ] = true;
				} else if ( 'false' === value ) {
					options[ key ] = false;
				}
			}
		}

		callback();
	},
};
