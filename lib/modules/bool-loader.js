'use strict';

/**
 * Converts all options that looks like a bool into a bool.
 *
 * This is helpful to send real boolean values in the body of a request.
 * For example, instead of sending '{"prop":"true"}', it will send '{"prop":true}'.
 *
 * User can use 'text:' prefix if it does not want this conversion, i.e. 'text:true', 'text:false'.
 */

module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
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

		return callback();
	},
};
