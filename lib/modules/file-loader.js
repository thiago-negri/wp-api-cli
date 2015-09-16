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

/**
 * Constructs a new FileLoader.
 *
 * @param obj      The object where the file content is to be loaded.
 * @param key      The object property name.
 * @param fileName The file name to load into the object's property.
 */
function FileLoader( obj, key, fileName ) {
	this.obj = obj;
	this.key = key;
	this.fileName = fileName;
}

/**
 * Change the content of an option by the content of a file.
 *
 * The option name comes from 'this.key' and the file name comes from 'this.fileName'.
 * The option is replaced in 'this.obj'.
 *
 * @param callback Called after loading the file.
 */
FileLoader.prototype.handler = function ( callback ) {
	var self = this;
	fs.readFile( self.fileName, 'utf8', function ( error, content ) {
		if ( error ) {
			return callback( error );
		}
		self.obj[ self.key ] = content;
		return callback();
	});
};

module.exports = {
	init: function ( context, api, options, callback ) {
		var	toReplace = [];

		[ options, options.parent ].forEach( function ( e ) {
			find.prefix( e, 'file:', function ( key, fileName ) {
				toReplace.push( new FileLoader( e, key, fileName ) );
			});
		});

		sequence( toReplace, 'handler', [], callback );
	},
};
