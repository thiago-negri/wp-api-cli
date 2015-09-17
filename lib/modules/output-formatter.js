'use strict';

var	yaml = require( 'js-yaml' );

/**
 * Filters the response to output it as YAML.
 *
 * @param response The CLI response.
 * @return The response in YAML representation.
 */
function yamlFormatter( response ) {
	/*
	 * Nothing to do if the response is a string.
	 */
	if ( typeof response === 'string' ) {
		return response;
	}

	/*
	 * Unwrap body from a HTTP response.
	 */
	if ( typeof response.statusCode !== 'undefined' ) {
		response = response.body;
	}

	/*
	 * Transforms the object into YAML representation.
	 */
	return yaml.safeDump( response );
}

module.exports = {

	options: {
		'raw': {
			alias: 'r',
			label: 'Raw output (default).',
		},
		'yaml': {
			alias: 'y',
			label: 'YAML output.',
		},
	},

	init: function ( context, api, options, callback ) {
		if ( options.parent.yaml ) {
			context.outputFilter = yamlFormatter;
		}
		return callback();
	},

};
