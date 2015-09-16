'use strict';

/**
 * Converts all options that looks like a bool into a bool.
 *
 * This is helpful to send real boolean values in the body of a request.
 * For example, instead of sending '{"prop":"true"}', it will send '{"prop":true}'.
 *
 * User can use 'text:' prefix if it does not want this conversion, i.e. 'text:true', 'text:false'.
 */

var	_ = require( 'lodash' );

module.exports = {
	init: function ( context, api, options, callback ) {
		var	iteratee = function ( value, key ) {
				if ( 'true' === value ) {
					this[ key ] = true;
				} else if ( 'false' === value ) {
					this[ key ] = false;
				}
			};

		[ options, options.parent ].forEach( function ( e ) {
			_.forOwn( e, iteratee, e );
		});

		return callback();
	},
};
