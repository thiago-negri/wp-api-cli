'use strict';

/**
 * Reads the content of an option from file.
 *
 * Scans all options with "file:" prefix and replaces its content by the
 * content of the file it points to.
 */

var	fs       = require( 'fs'                ),
	find     = require( '../utils/find'     ),
	sequence = require( '../utils/sequence' );

function FileLoader( key, fileName ) {
	this.key = key;
	this.fileName = fileName;
}

/**
 * Change the content of an option by the content of a file.
 *
 * The option name comes from 'this.key' and the file name comes from 'this.fileName'.
 *
 * @param options Command line options.
 * @param callback Called after loading the file.
 */
FileLoader.prototype.handler = function ( options, callback ) {
	var self = this;
	fs.readFile( self.fileName, 'utf8', function ( error, content ) {
		if ( error ) {
			return callback( error );
		}
		options[ self.key ] = content;
		return callback();
	});
};

module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
		var	toReplace;

		toReplace = [];
		find.prefix( options, 'file:', function ( key, fileName ) {
			toReplace.push( new FileLoader( key, fileName ) );
		});

		sequence( toReplace, 'handler', [ options ], callback );
	},
};
