'use strict';

/**
 * Keeps an option as a text.
 *
 * This lets users use "file:" (or other prefixes) as a real prefix of an
 * option content.
 */

var	find = require( '../utils/find' );

module.exports = {
	init: function ( context, api, options, callback ) {
		var	toReplace = [];

		find.prefix( options, 'text:', function ( key, value ) {
			toReplace.push({
				key: key,
				value: value,
			});
		});

		toReplace.forEach( function ( entry ) {
			options[ entry.key ] = entry.value;
		});

		if ( options.parent ) {
			toReplace = [];

			find.prefix( options.parent, 'text:', function ( key, value ) {
				toReplace.push({
					key: key,
					value: value,
				});
			});

			toReplace.forEach( function ( entry ) {
				options.parent[ entry.key ] = entry.value;
			});
		}

		return callback();
	},
};
