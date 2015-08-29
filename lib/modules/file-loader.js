/**
 * Reads the content of an option from file.
 *
 * Scans all options with "file:" prefix and replaces its content by the
 * content of the file it points to.
 */

var	fs       = require( 'fs'                ),
	sequence = require( '../utils/sequence' );

function fileLoader( options, callback ) {
	var self = this;
	fs.readFile( self.fileName, 'utf8', function ( error, content ) {
		if ( error ) {
			return callback( error );
		}
		options[ self.key ] = content;
		return callback();
	});
}

module.exports = {
	init: function ( cli, args, options, api, callback ) {
		var	key,
			value,
			fileName,
			fileContent,
			toReplace;

		toReplace = [];
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				value = options[ key ];
				if ( value && typeof value === 'string' ) {
					if ( value.slice( 0, 'file:'.length ) === 'file:' ) {
						fileName = value.slice( 'file:'.length );
						toReplace.push({
							key: key,
							fileName: fileName,
							handler: fileLoader,
						});
					}
				}
			}
		}

		sequence( toReplace, 'handler', [ options ], callback );
	},
};
