'use strict';

/**
 * Create options and commands based on actual API description (plus some helpers).
 */

var	fs    = require( 'fs'            ),
	qs    = require( 'querystring'   ),
	merge = require( 'merge'         ),
	find  = require( '../utils/find' ),

	gRoutes,
	gCliRoutes;

/**
 * Extracts all path params of a route URL.
 *
 * @param route Route URL.
 * @return Array of all options names of the URL.
 */
function extractOptionsPath( route ) {
	var	regex,
		match,
		param,
		options = [];

	regex = /\(\?P<([a-zA-Z0-9_\-]*)/g;
	match = regex.exec( route );
	while ( match !== null ) {
		param = match[1];
		options.push( param );
		match = regex.exec( route );
	}

	return options;
}

/**
 * Extracts all options available from all routes.
 *
 * Each path param and each endpoint arg of a route becomes an option.
 * The API description does not provide a label for each argument, so set each label to reference
 * the routes that use it, e.g. 'Used by "route1", "route2", "route3"'
 *
 * @param routes Routes object, as returned by WP-API description.
 * @return All available options, as expected by module definition.
 */
function extractOptions( routes, route ) {
	var	routeObj,
		options;

	function addOption( optionName ) {
		if ( options[ optionName ] ) {
			options[ optionName ].label += ', "' + route + '"';
		} else {
			options[ optionName ] = {
				label: 'Used by "' + route + '"',
				type : 'STRING',
			};
		}
	}

	function handleEndpoint( endpoint ) {
		var	arg;
		for ( arg in endpoint.args ) {
			if ( endpoint.args.hasOwnProperty( arg ) ) {
				addOption( arg );
			}
		}
	}

	options = {};

	/*
	 * Extract arguments from path of this route.
	 */
	extractOptionsPath( route ).forEach( addOption );

	/*
	 * Extract arguments from each endpoint of this route.
	 */
	routeObj = routes[ route ];
	if ( routeObj.endpoints ) {
		routeObj.endpoints.forEach( handleEndpoint );
	}

	return options;
}

/**
 * Discovers the route to use.
 */
function getRoute( context, options, api, routes ) {
	var	matchingRoutes = [],
		argCount = 0;

	/*
	 * For each possible route that this command is mapped to,
	 * find out how many arguments the user has passed in.
	 *
	 * The route with most matching arguments will win.
	 */
	routes.forEach( function ( route ) {
		var	routeArgs = extractOptionsPath( route ),
			currentArgCount,
			isMatch = true;
		currentArgCount = 0;
		routeArgs.forEach( function ( arg ) {
			currentArgCount += 1;
			if ( options[ arg ] === undefined || options[ arg ] === null ) {
				isMatch = false;
			}
		});
		if ( isMatch ) {
			if ( currentArgCount === argCount ) {
				matchingRoutes.push( route );
			} else if ( currentArgCount > argCount ) {
				matchingRoutes = [ route ];
				argCount = currentArgCount;
			}
		}
	});

	return matchingRoutes;
}

/**
 * Transforms a dictionary into its querystring.
 *
 * The args `('filter', { a: 1, b: null, c: 'foo' })` results in the querystring 'filter[a]=1&filter[b]&filter[c]=foo'.
 */
function objectToQuery( objName, obj ) {
	var	key,
		value,
		currentQueryParam,
		queryArray;

	queryArray = [];
	for ( key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			value = obj[ key ];
			currentQueryParam = objName + '[' + encodeURIComponent( key ) + ']';
			if ( value ) {
				currentQueryParam += '=' + encodeURIComponent( value );
			}
			queryArray.push( currentQueryParam );
		}
	}

	return queryArray.join( '&' );
}

/**
 * Builds the request to send to the API.
 */
function getRequestConfig( context, options, api, routes ) {
	var	matchingRoutes = getRoute( context, options, api, routes ),
		route,
		routeObj,
		routeArgs,
		endpointArgs = [],
		data = {},
		query,
		dictionaries,
		requestConfig = {};

	if ( matchingRoutes.length === 0 ) {
		return { error: 'No routes match. Are you missing an argument?' };
	}

	if ( matchingRoutes.length > 1 ) {
		return { error: 'Oops.. Ambiguous command, matching routes: ' + matchingRoutes.join(', ') };
	}

	route = matchingRoutes[0];
	routeObj = gRoutes[ route ];
	routeArgs = extractOptionsPath( route );

	/*
	 * Set path arguments.
	 */
	routeArgs.forEach( function( arg ) {
		route = route.replace( new RegExp('\\(\\?P<' + arg + '>[^\\)]*\\)'), encodeURIComponent( options[ arg ] ) );
	});

	/*
	 * Find arguments that the endpoint+method accepts.
	 */
	routeObj.endpoints.forEach( function( endpoint ) {
		var	key;
		if ( endpoint.methods.indexOf( api.method ) >= 0 ) {
			for ( key in endpoint.args ) {
				if ( endpoint.args.hasOwnProperty( key ) ) {
					endpointArgs.push( key );
				}
			}
		}
	});

	/*
	 * Set each argument that may be used.
	 */
	endpointArgs.forEach( function ( arg ) {
		if ( options[ arg ] !== undefined && options[ arg ] !== null ) {
			data[ arg ] = options[ arg ];
		}
	});

	if ( api.method === 'GET' || api.method === 'DELETE' ) {
		/*
		 * GET and DELETE does not support body, so pass the arguments as query parameters.
		 */
		dictionaries = [];
		find.objects( data, function ( dictName, dictData ) {
			if ( dictName !== 'parent' ) {
				dictionaries.push({
					name: dictName,
					data: dictData,
				});
			}
			delete data[ dictName ];
		});

		query = qs.stringify( data );

		dictionaries.forEach( function ( dict ) {
			if ( query ) {
				query += '&';
			}
			query += objectToQuery( dict.name, dict.data );
		});

		if ( query ) {
			route += '?' + query;
		}
	} else {
		requestConfig.body = data;
	}

	requestConfig.url = route;

	return requestConfig;
}

/**
 * Handles a command execution.
 *
 * Builds up a request and send it to the API.
 */
function commandHandler( routes ) {
	return function ( context, api, options, callback ) {
		var requestConfig = getRequestConfig( context, options, api, routes );
		if ( requestConfig.error ) {
			return callback( requestConfig.error );
		}
		return api.doRequest( requestConfig, callback );
	};
}

/**
 * Extract commands from routes.
 *
 * Each route is transformed into a command by taking each word in the path and joining them with a single underscore
 * symbol. Path arguments and namespaces are ignored.
 *
 * Examples:
 * - '/wp/v2/posts' => 'posts'
 * - '/wp/v2/posts/(?P<id>[\d]+)' => 'posts'
 * - '/wp/v2/posts/(?P<parent_id>[\d]+)/meta' => 'posts_meta'
 *
 * The same command may be mapped to multiple routes, on 'commandHandler' we know which route to use based on the
 * options the user set at the command line.
 *
 * @param routes Routes definitions, as returned by WP-API description.
 */
function extractCommands( routes ) {
	var	route,
		regex,
		match,
		commands,
		commandName,
		options;

	commands = {};
	for ( route in routes ) {
		if ( routes.hasOwnProperty( route ) ) {
			commandName = null;

			regex = /\/([\d\w]*)/g;
			match = regex.exec( route );
			while ( match !== null ) {
				if ( commandName === null ) {
					commandName = match[1];
				} else {
					commandName += '_' + match[1];
				}
				match = regex.exec( route );
			}

			commandName = commandName.replace( 'wp_v2_', '' ).replace( '__', '_' );
			if ( commandName.slice( -1 ) === '_' ) {
				commandName = commandName.slice( 0, -1 );
			}
			if ( commandName !== '' && commandName !== 'wp_v2' ) {
				options = extractOptions( routes, route );
				if ( commands[ commandName ] ) {
					commands[ commandName ].routes.push( route );
					commands[ commandName ].handler = commandHandler( commands[ commandName ].routes );
					commands[ commandName ].label += ', "' + route + '"';
					commands[ commandName ].options = merge( commands[ commandName ].options, options );
				} else {
					commands[ commandName ] = {
						label: '"' + route + '"',
						routes: [ route ],
						handler: commandHandler( [ route ] ),
						options: options,
					};
				}
			}
		}
	}

	return commands;
}

/**
 * Loads routes from 'api.json' file to extract options and commands, if it exists.
 */
function load( context, api, callback ) {
	fs.readFile( context.apiDescriptionFile, 'utf8', function ( error, fileContent ) {
		var	description;

		if ( error ) {
			if ( error.code !== 'ENOENT' ) {
				return callback( error );
			}
			return callback();
		}

		description = JSON.parse( fileContent );

		api.setApiDescription( description );

		gRoutes = description.routes;
		if ( gRoutes ) {
			gCliRoutes.commands = extractCommands( gRoutes );
		}

		return callback();
	});
}

gCliRoutes = {
	load: load,
};

module.exports = gCliRoutes;
