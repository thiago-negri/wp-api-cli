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
3. Go to your WordPress installation folder and create a new consumer key and secret for this CLI: `wp oauth1 add`
4. Authenticate this CLI: `wp-api-cli --site=http://example.com --oauth_key=CONSUMER_KEY --oauth_secret=CONSUMER_SECRET authenticate`
5. It will ask for an authorization token. Follow the steps on the browser, copy the authorization token and paste it in the console.
6. It will create a file with the OAuth tokens (`oauth.json`) for further use -- this is a sensitive file, make sure to protected it!

### Authenticating with HTTP Basic Auth

1. Install [WP-API/Basic-Auth from Git](https://github.com/WP-API/Basic-Auth) to support HTTP Basic Authentication, activate it.
2. Use options `--user` and `--pass` with every request you make.

Examples
--------

List all posts: `wp-api-cli --site=http://example.com post_list`

Create a new post: `wp-api-cli --site=http://example.com --post_title="Hello, WP-API" --post_content="WP-API is awesome!" post_create`

Useful Links
------------

- [WordPress.org Subversion download](https://wordpress.org/download/svn/)
- [WP-API project on GitHub](https://github.com/WP-API/WP-API)
- [Online documentation for WP-API v2](http://v2.wp-api.org/)
- [WP-API/OAuth1 project on GitHub](https://github.com/WP-API/OAuth1)
- [WP-API/Basic-Auth project on GitHub](https://github.com/WP-API/Basic-Auth)
- [Node.js](https://nodejs.org/)
- [WP-CLI](http://wp-cli.org/)
