'use strict';

/**
 * Keeps an option as a text.
 *
 * This lets users use "file:" (or other prefixes) as a real prefix of an
 * option content.
 */

var	find = require( '../utils/find' );

module.exports = {
	init: function ( context, cli, args, options, api, callback ) {
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

		callback();
	},
};
