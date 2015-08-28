Modules
=======

Each module may have the following properties.

Load
----

Property:

```javascript
	load: function ( wpApi, callback ) {
	}
```

Fired after building WpApi object, before parsing command line arguments.

Init
----

Property:

```javascript
	init: function ( cli, args, options, wpApi, callback ) {
	}
```

Fired after parsing command line arguments, before handling the command.

Options
-------

Property:

```javascript
	options: {
		'full_name': [ 'short_name', 'description', 'type', 'defaultValue' ]
	}
```

Should contain all options that the module provides.
Read after `load` and before `init`.

- `full_name` is the full name of the option, e.g. `site` will result in an option `--site`.
- `short_name` is the alias of the option, e.g. `s` will result in an option `-s`.
- `description` is the description of the option, used to output in `--help`.
- `type` is the type of the option, types are the same available by `cli` package.
- `defaultValue` sets a default value for the option.

Commands
--------

Property:

```javascript
	commands: {
		'command_name': {
			label: 'description',
			handler: function ( cli, args, options, api ) {
			}
		}
	}
```

Should contain all commands that the module provides.
Read after `load` and before `init`.

- `command_name` is the command name, e.g. `authenticate`.
- `description` is the description of the command, used to output in `--help`.
- The `handler` function is called when the user wants to execute this command.

Full Example
------------

Create the file `lib/modules/greet.js`:

```javascript
	'use strict';

	var	fs = require( 'fs' ),
		salutation;

	module.exports = {

		load: function ( api, callback ) {
			fs.readFile( 'salutation.default', 'utf8', function ( error, content ) {
				if ( error ) {
					if ( error.code === 'ENOENT' ) {
						return callback();
					}
					return callback( error );
				}
				salutation = content;
				return callback();
			});
		},

		init: function ( cli, args, options, wpApi, callback ) {
			if ( options.salutation ) {
				salutation = options.salutation;
				return fs.writeFile( 'salutation.default', salutation, function ( error ) {
					if ( error ) {
						return callback( error );
					}
					return callback();
				});
			} else if ( ! salutation ) {
				return cli.fatal( 'Please, provide an initial salutation. ' +
				                  'It will be cached in a file afterwards.' );
			}
			return callback();
		},

		options: {
			'salutation' : [ 'x', 'Salutation to use.',  'STRING' ],
			'name'       : [ 'n', 'Name to be greeted.', 'STRING', 'World' ],
		},

		commands: {
			'greet': {
				label   : 'Greet someone.',
				handler : function ( cli, args, options, api ) {
					var	greetings;
					greetings = salutation + ', ' + options.name;
					cli.ok( greetings );
				}
			},
		},

	}
```

Add the module in `lib/modules.js`:

```javascript
	require( './modules/greet' ),
```

Have fun!

Usage:

```
$ wp-api-cli greet
ERROR: Please, provide an initial salutation. It will be cached in a file afterwards.

$ wp-api-cli greet --salutation Hello
OK: Hello, World

$ wp-api-cli greet --name Thiago
OK: Hello, Thiago

$ wp-api-cli greet -x Ola -n Mundo
OK: Ola, Mundo
```
