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

/**
 * Wraps a formatter into a projector first.
 *
 * @param project   Values to project from, it's a single string with comma separated values.
 * @param formatter Formatter called after projecting properties.
 */
function projectProperties( project, formatter ) {
	var	properties = project.split( ',' );

	return function ( response ) {
		var	target,
			projector = function ( e ) {
				_.forOwn( e, function ( value, key ) {
					if ( ! _.includes( properties, key ) ) {
						delete e[ key ];
					}
				});
			};

		/*
		 * If it is HTTP response object, target the projection in its body.
		 */
		if ( typeof response.statusCode !== 'undefined' ) {
			target = response.body;
		} else {
			target = response;
		}

		/*
		 * If the target is an array, apply the projection in each entry.
		 */
		if ( typeof target.length !== 'undefined' ) {
			target.forEach( projector );
		} else {
			projector( target );
		}

		return formatter( response );
	};
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
		'project': {
			alias: 'p',
			label: 'Set which properties to show on output, comma separated.',
			type : 'STRING',
		},
	},

	init: function ( context, api, options, callback ) {
		/*
		 * Set output formatter.
		 */
		if ( options.parent.yaml ) {
			context.outputFilter = yamlFormatter;
		} else if ( options.parent.table ) {
			context.outputFilter = tableFormatter;
		} else {
			context.outputFilter = rawFormatter;
		}

		/*
		 * Wrap output formatter into a filtering function.
		 */
		if ( options.parent.project ) {
			context.outputFilter = projectProperties( options.parent.project, context.outputFilter );
		}

		return callback();
	},

};
