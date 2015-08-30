'use strict';

/**
 * Create options and commands based on actual API description (plus some helpers).
 */

var	fs   = require( 'fs'            ),
	qs   = require( 'querystring'   ),
	find = require( '../utils/find' ),

	routes,
	cliRoutes;

/**
 * Extracts all path params of a route URL.
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
 */
function extractOptions( routes ) {
	var	route,
		routeObj,
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

	for ( route in routes ) {
		if ( routes.hasOwnProperty( route ) ) {
			/*
			 * Extract arguments from path of this route.
			 */
			extractOptionsPath( route ).forEach( addOption );

			/*
			 * Extract arguments from each endpoint of this route.
			 */
			routeObj = routes[ route ];
			routeObj.endpoints.forEach( handleEndpoint );
		}
	}

	return options;
}

/**
 * Discovers the route to use.
 */
function getRoute( cli, args, options, api ) {
	var	routes = cliRoutes.commands[ cli.command ].routes,
		matchingRoutes = [],
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

	if ( matchingRoutes.length === 0 ) {
		return cli.fatal( 'No routes match. Are you missing an argument?' );
	}

	if ( matchingRoutes.length > 1 ) {
		return cli.fatal( 'Oops.. Ambiguous command, matching routes: ' + matchingRoutes.join(', ') );
	}

	return matchingRoutes[0];
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
function getRequestConfig( cli, args, options, api ) {
	var	route = getRoute( cli, args, options, api ),
		routeObj = routes[ route ],
		routeArgs = extractOptionsPath( route ),
		endpointArgs = [],
		data = {},
		query,
		dictionaries,
		requestConfig = {};

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
		find.objects( options, function ( dictName, dictData ) {
			dictionaries.push({
				name: dictName,
				data: dictData,
			});
			delete data[ dictName ];
		});

		query = qs.stringify( data );

		if ( dictionaries.length > 0 ) {
			if ( query ) {
				query += '&';
			}
			dictionaries.forEach( function ( dict ) {
				query += objectToQuery( dict.name, dict.data );
			});
		}

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
function commandHandler( cli, args, options, api ) {
	var requestConfig = getRequestConfig( cli, args, options, api );
	api.doRequest( requestConfig, function ( error, response ) {
		if ( error ) {
			return cli.fatal( error );
		}
		console.log( JSON.stringify( response, null, '  ' ) );
	});
}

function withLength( text, length, filler ) {
	var	delta,
		result;
	result = text;
	for ( delta = length - text.length; delta > 0; delta -= 1 ) {
		result += filler;
	}
	return result;
}

function handleInfoCommand( cli, args, options, api ) {
	var	cmd,
		cmdRoutes,
		keyLength = 20,
		keyFiller = '.';
	if ( ! cliRoutes.commands.hasOwnProperty( args[0] ) ) {
		return cli.fatal( 'Unknown command "' + args[0] + '"' );
	}
	cmd = cliRoutes.commands[ args[0] ];
	cmdRoutes = cmd.routes;
	cmdRoutes.forEach( function( route ) {
		var	routeObj = {},
			pathOptions;
		routeObj = routes[ route ];
		cli.info( '' );
		cli.info( 'Route: ' + route );
		pathOptions = extractOptionsPath( route );
		if ( pathOptions.length > 0 ) {
			cli.info( '  Path arguments (required):' );
			pathOptions.forEach( function ( arg ) {
				if ( cliRoutes.options[ arg ] !== undefined ) {
					cli.info( '    --' + arg );
				}
			});
		}
		routeObj.endpoints.forEach( function ( endpoint ) {
			var	key,
				description,
				accepts;
			cli.info( '  Arguments for ' + endpoint.methods.join(', ') + ':' );
			for ( key in endpoint.args ) {
				if ( endpoint.args.hasOwnProperty( key ) ) {
					if ( cliRoutes.options[ key ] !== undefined ) {
						description = endpoint.args[ key ].description;
						if ( ! description ) {
							/*
							 * If argument has no description, try to fetch it from schema.
							 */
							if ( routeObj.schema && routeObj.schema.properties[ key ] ) {
								description = routeObj.schema.properties[ key ].description;
							}
						}

						accepts = endpoint.args[ key ].accepts;
						if ( accepts ) {
							if ( ! description ) {
								description = '';
							}
							description += ' (Accepts ' + accepts.join(', ') + ')';
						}

						if ( description ) {
							cli.info( '    --' + withLength( key, keyLength, keyFiller ) + ': ' + description );
						} else {
							cli.info( '    --' + key );
						}
					}
				}
			}
		});
	});
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
 */
function extractCommands( routes ) {
	var	route,
		regex,
		match,
		commands,
		commandName;

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
				if ( commands[ commandName ] ) {
					commands[ commandName ].routes.push( route );
					commands[ commandName ].label += ', "' + route + '"';
				} else {
					commands[ commandName ] = {
						label: '"' + route + '"',
						routes: [ route ],
						handler: commandHandler,
					};
				}
			}
		}
	}

	/**
	 * Add our own commands.
	 */
	commands.info = {
		label: 'List arguments available to a command.',
		handler: handleInfoCommand,
	};

	return commands;
}

/**
 * Loads routes from 'api.json' file to extract options and commands, if it exists.
 */
function load( api, callback ) {
	fs.readFile( __dirname + '/api.json', 'utf8', function ( error, fileContent ) {
		var	site,
			rootRoute,
			baseUrl,
			description;

		if ( error ) {
			if ( error.code !== 'ENOENT' ) {
				return callback( error );
			}
			return callback();
		}

		description = JSON.parse( fileContent );

		site   = description.url;
		routes = description.routes;

		if ( site ) {
			api.setSite( site );
		}

		if ( routes ) {
			rootRoute = routes[ '/' ];
			if ( rootRoute && rootRoute._links ) {
				baseUrl = rootRoute._links.self;
				if ( baseUrl ) {
					api.setBaseUrl( baseUrl );
				}
			}
			cliRoutes.options = extractOptions( routes );
			cliRoutes.commands = extractCommands( routes );
		}

		return callback();
	});
}

cliRoutes = {
	load: load,
};

module.exports = cliRoutes;
