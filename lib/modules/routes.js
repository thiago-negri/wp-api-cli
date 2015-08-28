/**
 * Create options and commands based on actual API description (plus some helpers).
 */

var	fs  = require( 'fs'          ),
	qs  = require( 'querystring' ),
	md5 = require( 'md5'         ),

	routes;

/**
 * Loads routes from 'api.json' file to extract options and commands, if it exists.
 */
function load( api, callback ) {
	fs.readFile( 'api.json', 'utf8', function ( error, fileContent ) {
		var	site,
			rootRoute,
			baseUrl;

		if ( error ) {
			if ( error.code !== 'ENOENT' ) {
				return callback( error );
			} else {
				return callback();
			}
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
			options[ optionName ][1] += ', "' + route + '"';
		} else {
			options[ optionName ] = [ false, 'Used by "' + route + '"', 'STRING' ];
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

	/*
	 * Add our own options.
	 *
	 * Let the user change the HTTP method to use.
	 * Helpers to add a file as attachment.
	 */
	options.method = [ 'X', 'HTTP method to use.', 'STRING', 'GET' ];
	if ( options.content !== undefined ) {
		options.content_file = [ false, 'Load "content" from FILE', 'FILE' ];
	}
	options.attachment = [ false, 'Add FILE as attachment', 'FILE' ];
	options.attachment_type = [ false, 'Content-Type of attachment', 'FILE' ];
	options.attachment_name = [ false, 'Name of attachment', 'STRING' ];

	return options;
}

/**
 * Extracts all path params of a route URL.
 */
function extractOptionsPath( route ) {
	var	options = [];

	regex = /\(\?P<([^>]*)/g;
	match = regex.exec( route );
	while ( match !== null ) {
		param = match[1];
		options.push( param );
		match = regex.exec( route );
	}

	return options;
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

			regex = /\/([\d\w-]*)/g;
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
		handler: command_info,
	};

	return commands;
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

function command_info( cli, args, options, api ) {
	var	cmd,
		cmdRoutes,
		pathOptions,
		keyLength = 20,
		keyFiller = '.';
	if ( ! cliRoutes.commands.hasOwnProperty( args[0] ) ) {
		return cli.fatal( 'Unknown command "' + args[0] + '"' );
	}
	cmd = cliRoutes.commands[ args[0] ];
	cmdRoutes = cmd.routes;
	cmdRoutes.forEach( function( route ) {
		var	routeObj = {},
			options,
			key;
		routeObj = routes[ route ];
		options = extractOptionsPath( route );
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
			var	key;
			cli.info( '  Arguments for ' + endpoint.methods.join(', ') + ':' );
			for ( key in endpoint.args ) {
				if ( endpoint.args.hasOwnProperty( key ) ) {
					if ( cliRoutes.options[ key ] !== undefined ) {
						if ( routeObj.schema.properties[ key ] ) {
							cli.info( '    --' + withLength( key, keyLength, keyFiller ) + ': ' + routeObj.schema.properties[ key ].description );
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

/**
 * Builds the request to send to the API.
 */
function getRequestConfig( cli, args, options, api ) {
	var	route = getRoute( cli, args, options, api ),
		routeObj = routes[ route ],
		routeArgs = extractOptionsPath( route ),
		endpointArgs = [],
		data = {},
		key,
		query,
		requestConfig = {};

	/*
	 * Helper to set the 'content' based on a file.
	 */
	if ( options.content_file ) {
		options.content = fs.readFileSync( options.content_file, 'utf8' );
	}

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
		if ( endpoint.methods.indexOf( options.method ) >= 0 ) {
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

	requestConfig.method = options.method;

	if ( options.method === 'GET' || options.method === 'DELETE' ) {
		/*
		 * GET and DELETE does not support body, so pass the arguments as query parameters.
		 */
		query = qs.stringify( data );
		if ( query ) {
			route += '?' + query;
		}
	} else {
		/*
		 * Send data in body.
		 *
		 * Helper to send an attached file with the request.
		 */
		if ( options.attachment ) {
			if ( options.attachment_name || options.attachment_type ) {
				data.file = {
					value: fs.createReadStream( options.attachment ),
					options: {
						filename:    options.attachment_name,
						contentType: options.attachment_type,
					}
				};
			} else {
				data.file = fs.createReadStream( options.attachment );
			}
			requestConfig.headers = {
				'Content-MD5': md5( fs.readFileSync( options.attachment ) )
			};
			requestConfig.formData = data;
		} else {
			requestConfig.body = data;
		}
	}

	requestConfig.url = route;

	return requestConfig;
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
			if ( currentArgCount == argCount ) {
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

cliRoutes = {
	load: load,
};

module.exports = cliRoutes;
