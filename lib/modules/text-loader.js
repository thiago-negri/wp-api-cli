'use strict';

/**
 * Keeps an option as a text.
 *
 * This lets users use "file:" as a real prefix of an option content.
 */

var	findPrefix  = require( '../utils/find-prefix' ),

	/**
	 * All options that are supposed to be handled as texts will be
	 * in this object as a property with "true" value.
	 *
	 * This is exported, so other modules can check whether a property
	 * should be handled as pure text or not.
	 */
	textOptions = {};

module.exports = {
	init: function ( cli, args, options, api, callback ) {
		var	toReplace = [];

		findPrefix( options, 'text:', function ( key, value ) {
			toReplace.push({
				key: key,
				value: value,
			});
		});

		toReplace.forEach( function ( entry ) {
			textOptions[ entry.key ] = true;
			options[ entry.key ] = entry.value;
		});

		callback();
	},
	textOptions: textOptions,
};
