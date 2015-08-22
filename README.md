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

Commands
--------

### Help

See all available arguments and commands by reading the help.

```bash
wp-api-cli --help
```

### List all Posts

```bash
wp-api-cli -s https://example.com post_list
```

### Create a Post

#### From file

To create a new Post from a file, use `post_json` argument to point to the file.
The file content should be a JSON with the [schema expected from WP-API endpoint](http://v2.wp-api.org/#posts).

```bash
wp-api-cli -s https://example.com \
	--post_json post.json \
	post_create
```

#### From the command line

You may create a new Post from the command line, by using the `post_*` arguments.

The content of the Post may be set by:

1. `post_content_file=FILE`, the content will be the FILE content.
2. `post_content=STRING`, the content will be the STRING set to this argument.
3. `post_content_file=stdin`, the content will be read from STDIN.

```bash
wp-api-cli -s https://example.com \
	--post_title "Hello, WP-API" \
	--post_content_file hello-wp-api.html \
	post_create
```

### Fetch a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	post_get
```

### Update a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--post_title "Hello, dear WP-API" \
	post_update
```

### Delete a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	post_delete
```


### List all Pages

```bash
wp-api-cli -s https://example.com page_list
```

### Create a Page

#### From file

To create a new Page from a file, use `page_json` argument to point to the file.
The file content should be a JSON with the [schema expected from WP-API endpoint](http://v2.wp-api.org/#pages).

```bash
wp-api-cli -s https://example.com \
	--page_json page.json \
	post_create
```

#### From the command line

You may create a new Page from the command line, by using the `page_*` arguments.

The content of the Page may be set by:

1. `page_content_file=FILE`, the content will be the FILE content.
2. `page_content=STRING`, the content will be the STRING set to this argument.
3. `page_content_file=stdin`, the content will be read from STDIN.

```bash
wp-api-cli -s https://example.com \
	--page_title "Hello, WP-API" \
	--page_content_file hello-wp-api.html \
	page_create
```

### Fetch a Page

```bash
wp-api-cli -s https://example.com \
	--page_id 2 \
	page_get
```

### Update a Page

```bash
wp-api-cli -s https://example.com \
	--page_id 2 \
	--page_title "Hello, dear WP-API" \
	page_update
```

### Delete a Page

```bash
wp-api-cli -s https://example.com \
	--page_id 2 \
	page_delete
```


### List all Medias

```bash
wp-api-cli -s https://example.com media_list
```

### Create a Media

A Media is made of metadata and a file attachment.

The file attachment may be set by options:

1. `media_file`: Set the file to be loaded as an attachment.
2. `media_file_name`: Optional. Set the resulting file name in the server. If set, you **must** set `media_file_type` too.
3. `media_file_type`: Optional. Set the Content-Type of the attachment. If set, you **must** set `media_file_name` too.

#### Metadata from file

To create a new Media from a file, use `media_json` argument to point to the file.
The file content should be a JSON with the [schema expected from WP-API endpoint](http://v2.wp-api.org/#media).

```bash
wp-api-cli -s https://example.com \
	--media_json media.json \
	--media_file TheMedia.png \
	media_create
```

#### Metadata from the command line

You may create a new Media from the command line, by using the `media_*` arguments.

```bash
wp-api-cli -s https://example.com \
	--media_alt_text "A picture of myself" \
	--media_file TheMedia.png \
	media_create
```

### Fetch a Media

```bash
wp-api-cli -s https://example.com \
	--media_id 2 \
	media_get
```

### Update a Media

```bash
wp-api-cli -s https://example.com \
	--media_id 2 \
	--media_caption "That's me" \
	media_update
```

### Delete a Media

(!) This is not working. Server is returning 501. See "[WP-API/WP-API: Can't delete Media](https://github.com/WP-API/WP-API/issues/1493)".

```bash
wp-api-cli -s https://example.com \
	--media_id 2 \
	media_delete
```

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

- [WP-API/WP-API: Can't retrieve unpublished posts](https://github.com/WP-API/WP-API/issues/1491)
- [WP-API/WP-API: Can't delete Media](https://github.com/WP-API/WP-API/issues/1493)
- [WP-API/WP-API: Fix file upload for attachments](https://github.com/WP-API/WP-API/pull/1492)
- [WP-API/OAuth1: Fix signature check for sub-folder WP installs](https://github.com/WP-API/OAuth1/pull/78)
