'use strict';

var	_          = require( 'lodash'       ),
	yaml       = require( 'js-yaml'      ),
	asciitable = require( 'asciitable'   ),
	log        = require( '../utils/log' );

/**
 * Filters the response to output as a formatted JSON.
 *
 * @param response The CLI response.
 * @return The response in formatted JSON representation.
 */
function rawFormatter( response ) {
	if ( typeof response === 'string' ) {
		return response;
	}

	if ( typeof response.statusCode !== 'undefined' ) {
		return log.response( response, true );
	}

	return JSON.stringify( response, null, '  ' );
}

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

/**
 * Filters the response to output it as a table.
 *
 * @param response The CLI response.
 * @return The response in table representation.
 */
function tableFormatter( response ) {
	var	newResponse,
		renderedProjector;

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
	 * Transforms the object into table representation.
	 *
	 * Properties that contains a 'rendered' sub-property are flattened
	 * before rendering.
	 */
	newResponse = _.clone( response, true );

	renderedProjector = function ( e ) {
		_.forOwn( e, function ( value, key ) {
			if ( typeof value.rendered !== 'undefined' ) {
				e[ key ] = value.rendered;
			}
		});
	};

	if ( typeof newResponse.length !== 'undefined' ) {
		newResponse.forEach( renderedProjector );
	} else {
		renderedProjector( newResponse );
	}

	return asciitable( newResponse );
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
		'table': {
			alias: 't',
			label: 'Table output.',
		},
	},

	init: function ( context, api, options, callback ) {
		if ( options.parent.yaml ) {
			context.outputFilter = yamlFormatter;
		} else if ( options.parent.table ) {
			context.outputFilter = tableFormatter;
		} else {
			context.outputFilter = rawFormatter;
		}
		return callback();
	},

};
