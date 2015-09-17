'use strict';

var	http = require( 'http' );

/**
 * Creates a logging function for an object.
 *
 * @param type Object type. Accepts 'request', 'response'.
 * @return Logger function.
 */
function log( type ) {
	return function ( object, noOutput ) {
		var	key,
			fn,
			result;

		if ( ! module.exports.enabled ) {
			return;
		}

		if ( noOutput ) {
			result = '';
			fn = function () {
				var	i, len, innerResult;
				innerResult = [];
				for ( i = 0, len = arguments.length; i < len; i += 1 ) {
					innerResult.push( arguments[ i ] );
				}
				result += innerResult.join( ' ' ) + '\n';
			};
		} else {
			fn = console.log;
		}

		fn( '---', type.toUpperCase(), '---' );
		fn();
		if ( type === 'request' ) {
			fn( object.method, object.url );
		} else if ( type === 'response' ) {
			fn( object.statusCode, http.STATUS_CODES[ object.statusCode ] );
		}
		fn();
		if ( object.headers ) {
			for ( key in object.headers ) {
				if ( object.headers.hasOwnProperty( key ) ) {
					fn( key + ': ' + object.headers[ key ] );
				}
			}
			fn();
		}
		if ( object.body ) {
			fn( JSON.stringify( object.body, null, '  ' ) );
		}
		fn();

		return result;
	};
}

module.exports = {
	request  : log( 'request'  ),
	response : log( 'response' ),
	enabled  : true,
};