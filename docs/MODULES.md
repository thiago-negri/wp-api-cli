Modules
=======

Each module may have the following properties.

Load
----

Property:

```javascript
	load: function ( context, api, callback ) {
	}
```

Fired after building WpApi object, before parsing command line arguments.

Init
----

Property:

```javascript
	init: function ( context, api, options, callback ) {
	}
```

Fired after parsing command line arguments, before handling the command.

The `options` object is relative to the command, the global options are in `options.parent`.

Options
-------

Property:

```javascript
	options: {
		'full_name': {
			alias: 'short_name',
			label: 'description',
			type: 'type'
		}
	}
```

Should contain all options that the module provides.
Read after `load` and before `init`.

- `full_name` is the full name of the option, e.g. `site` will result in an option `--site`.
- `short_name` is the alias of the option, e.g. `s` will result in an option `-s`.
- `description` is the description of the option, used to output in `--help`.
- `type` is the type of the option, accept `'STRING'` and `'BOOLEAN'`, default is `'BOOLEAN'`.
- `defaultValue` sets a default value for the option.

Commands
--------

Property:

```javascript
	commands: {
		'command_name': {
			args: [ 'arg_0', 'arg_1' ]
			label: 'description',
			options: {
				'full_name': {
					alias: 'short_name',
					label: 'description',
					type: 'type',
					defaultValue: 'defaultValue'
				}
			},
			handler: function ( context, api, arg_0, arg_1, options, callback ) {
			}
		}
	}
```

Should contain all commands that the module provides.
Read after `load` and before `init`.

- `command_name` is the command name, e.g. `authenticate`.
- `description` is the description of the command, used to output in `--help`.
- `args` is an array with the positional command line arguments that this command needs.
- `options` should contain an object with the same properties as the module options, it defines options that aren't global.
- The `handler` function is called when the user wants to execute this command.

Full Example
------------

Create the file `lib/modules/greet.js`:

```javascript
	'use strict';

	var	fs = require( 'fs' ),
		salutation;

	module.exports = {

		load: function ( context, api, callback ) {
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

		init: function ( context, api, options, callback ) {
			if ( options.parent.salutation ) {
				salutation = options.parent.salutation;
				return fs.writeFile( 'salutation.default', salutation, function ( error ) {
					if ( error ) {
						return callback( error );
					}
					return callback();
				});
			} else if ( ! salutation ) {
				return callback( 'Please, provide an initial salutation. ' +
				                  'It will be cached in a file afterwards.' );
			}
			return callback();
		},

		options: {
			'salutation': {
				alias: 'x',
				label: 'Salutation to use.',
				type : 'STRING',
			},
		},

		commands: {
			'greet': {
				args    : [ 'name' ],
				label   : 'Greet someone.',
				options : {
					'strong': {
						alias: 'p',
						label: 'A strong greeting',
					},
				},
				handler : function ( context, api, name, options, callback ) {
					var	greetings;
					greetings = salutation + ', ' + name;
					if ( options.strong ) {
						greetings += '!';
					}
					console.log( greetings );
					return callback();
				}
			},
		},

	};
```

Add the module in `lib/modules.js`:

```javascript
	require( './modules/greet' ),
```

Have fun!

Usage:

```
$ wp-api-cli -h

  Usage: index [options] [command]


  Commands:

    greet [options] <name>  Greet someone.

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -x, --salutation <string>  Salutation to use.

$ wp-api-cli greet -h

  Usage: greet [options] <name>

  Greet someone.

  Options:

    -h, --help    output usage information
	-p, --strong  A strong greeting

$ wp-api-cli greet World
ERROR: Init Error: Please, provide an initial salutation. It will be cached in a file afterwards.

$ wp-api-cli greet World --salutation Hello
Hello, World

$ wp-api-cli greet Thiago
Hello, Thiago

$ wp-api-cli greet Mundo -x Ola -p
Ola, Mundo!
```
