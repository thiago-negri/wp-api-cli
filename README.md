CLI for WordPress.org REST API v2
=================================

CLI to help test-drive the WordPress.org REST API.

Installing
----------

1. WP-API v2 depends on the latest WordPress.org, so [download it from Subversion](https://wordpress.org/download/svn/).
2. Install [WP-API plugin from Git](https://github.com/WP-API/WP-API) and activate it.
3. Install [Node.js](https://nodejs.org/).
4. Download this repository, and install it on your system: `npm install`

### Authenticating with OAuth

1. Install [WP-API/OAuth1 from Git](https://github.com/WP-API/OAuth1) to support OAuth authentication, activate it.
    - If your WordPress install is inside a folder, please check [pull request 78](https://github.com/WP-API/OAuth1/pull/78).
2. Install [WP-CLI](http://wp-cli.org/) to generate OAuth keys.
3. Go to your WordPress installation folder and create a new consumer key and secret for this CLI:

    ```bash
    wp oauth1 add
    ```

4. Authenticate this CLI:

    ```bash
    wp-api-cli --site=http://example.com \
        --oauth_key=CONSUMER_KEY         \
        --oauth_secret=CONSUMER_SECRET   \
        --oauth_file=oauth.json          \
        authenticate
    ```

5. It will ask for an authorization token. Follow the steps on the browser, copy the authorization token and paste it in the console.
6. It will create a file with the OAuth tokens (`oauth.json`) for further use -- this is a sensitive file, make sure to protect it!
7. When you execute a command, the CLI will look for the file `oauth.json` to grab the OAuth tokens, you may set a different file to
    use with the option `--oauth_file`.

### Authenticating with HTTP Basic Auth

1. Install [WP-API/Basic-Auth from Git](https://github.com/WP-API/Basic-Auth) to support HTTP Basic Authentication, activate it.
2. Use options `--http_user` and `--http_pass` with every request you make.

Developers
----------

The project is structured as follows:

1. File `index.js` is the entry point, it will execute main defined in `wp-api-cli.js`.
1. File `lib/wp-api-cli.js` wires everything up.
2. File `lib/wp-api.js` is the class that communicates with the REST APIs.
3. File `lib/modules.js` load all modules that provide options and commands to be used at the command line.
	- `lib/modules/auth.js` handles authentication.
	- `lib/modules/debug.js` let you see debug messages.
	- `lib/modules/describe.js` let you fetch a description of the API.
	- `lib/modules/file-loader.js` handles loading options from file.
	- `lib/modules/insecure.js` allows connection to insecure sites (e.g. self-signed certificates).
	- `lib/modules/routes.js` handles all commands and options based on actual API description (plus some helpers).
		It reads the API description from a file and builds the options and commands dynamically.
	- `lib/modules/site.js` let you set which site the CLI will connect to.
	- `lib/modules/text-loader.js` handles `text:` prefix.
	- `lib/modules/update.js` fetches the API description and writes it to a file for further use by `routes.js`.
4. Files in `lib/utils` are utility functions to make coding easier.

If you want to create a new set of commands, drop a file in `lib/modules` and load it in `modules.js`. Full explanation in [MODULES.md](MODULES.md). *TODO - Create a auto-loading mechanism.*

Commands
--------

After installing the CLI, you need to update its definition:

```bash
wp-api-cli --site=https://example.com update
```

This will create a file `api.json` that will be used to dynamically set the options and commands available to use. Ask for help to see everything available:

```bash
wp-api-cli --help
```

See [COMMANDS.md](COMMANDS.md) for examples of available commands.

Useful Links
------------

- [WordPress.org Subversion download](https://wordpress.org/download/svn/)
- [WP-API project on GitHub](https://github.com/WP-API/WP-API)
- [Online documentation for WP-API v2](http://v2.wp-api.org/)
- [WP-API/OAuth1 project on GitHub](https://github.com/WP-API/OAuth1)
- [WP-API/Basic-Auth project on GitHub](https://github.com/WP-API/Basic-Auth)
- [Node.js](https://nodejs.org/)
- [WP-CLI](http://wp-cli.org/)

Related Issues and Pull Requests
--------------------------------

### Issues

- [WP-API/WP-API: Can't retrieve unpublished posts](https://github.com/WP-API/WP-API/issues/1491)
- [WP-API/WP-API: Can't delete Media](https://github.com/WP-API/WP-API/issues/1493)
- [WP-API/WP-API: Can't read a specific Meta for a Post](https://github.com/WP-API/WP-API/issues/1494)
- [WP-API/WP-API: Can't delete Meta for a Post](https://github.com/WP-API/WP-API/issues/1495)
- [WP-API/WP-API: Can't read specific Revision for a Post](https://github.com/WP-API/WP-API/issues/1498)

### Fixes

- [WP-API/WP-API: Fix file upload for attachments](https://github.com/WP-API/WP-API/pull/1492)
- [WP-API/OAuth1: Fix signature check for sub-folder WP installs](https://github.com/WP-API/OAuth1/pull/78)
- [WP-API/WP-API: Fix MD5 check on file uploads](https://github.com/WP-API/WP-API/pull/1508)

### Features

- [WP-API/WP-API: Add help properties to endpoint arguments](https://github.com/WP-API/WP-API/pull/1511)
