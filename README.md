CLI for WordPress.org REST API v2
=================================

CLI to help test-drive the WordPress.org REST API.

Installing
----------

1. WP-API v2 depends on the latest WordPress.org, so [download it from Subversion](https://wordpress.org/download/svn/).
2. Install [WP-API plugin from Git](https://github.com/WP-API/WP-API) and activate it.
3. Install [WP-API/OAuth1 from Git](https://github.com/WP-API/OAuth1) to support OAuth authentication, activate it.
    - If your WordPress install is inside a folder, please check [pull request 78](https://github.com/WP-API/OAuth1/pull/78).
4. Install [WP-API/Basic-Auth from Git](https://github.com/WP-API/Basic-Auth) to support HTTP Basic Authentication, activate it.
5. Install [WP-CLI](http://wp-cli.org/) to generate OAuth keys.
6. Create a new OAuth key for the CLI: `wp oauth1 add`.
7. Install [Node.js](https://nodejs.org/).
8. Download this repository, and install it on your system: `npm install`.
9. etc -- OAuth authentication not working so far.

Examples
--------

List all posts: `wp-api-cli --url=http://example.com --user=foo --pass=bar post list`

Useful Links
------------

- [WordPress.org Subversion download](https://wordpress.org/download/svn/)
- [WP-API project on GitHub](https://github.com/WP-API/WP-API)
- [Online documentation for WP-API v2](http://v2.wp-api.org/)
