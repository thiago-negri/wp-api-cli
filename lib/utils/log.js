'use strict';

var	http = require( 'http' );

/**
 * Creates a logging function for an object.
 *
 * @param type Object type. Accepts 'request', 'response'.
 * @return Logger function.
 */
function log( type ) {
	return function ( object ) {
		var	key;

		if ( ! module.exports.enabled ) {
			return;
		}

		console.log( '---', type.toUpperCase(), '---' );
		console.log();
		if ( type === 'request' ) {
			console.log( object.method, object.url );
		} else if ( type === 'response' ) {
			console.log( object.statusCode, http.STATUS_CODES[ object.statusCode ] );
		}
		console.log();
		if ( object.headers ) {
			for ( key in object.headers ) {
				if ( object.headers.hasOwnProperty( key ) ) {
					console.log( key + ': ' + object.headers[ key ] );
				}
			}
			console.log();
		}
		if ( object.body ) {
			console.log( JSON.stringify( object.body, null, '  ' ) );
		}
		console.log();
	};
}

module.exports = {
	request  : log( 'request'  ),
	response : log( 'response' ),
	enabled  : true,
};