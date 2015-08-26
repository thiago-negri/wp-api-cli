Commands
========

See all available arguments and commands by reading the help.

```bash
wp-api-cli --help
```

Basic options
-------------

- `--insecure` or `-k` lets you connect to insecure sites (e.g. with self-signed certificates).
- `--debug` or `-d` will print each HTTP request issued to the server.
- `--site` or `-s` will set the site to connect to.
- `--method` or `-X` defines the HTTP verb to use in the request, defaults to `GET`.

Helpers
-------

These options are not in the API, they only exist in the CLI to help you.

- `--content_file` let you set a file to load the `--content` option from.
- `--attachment` let you set a file to send as an attachment of the request, needed to create Media. See also `--attachment_type` and `--attachment_name`.

Describe the API
----------------

Outputs a description of the API. It is easier to see if you output it to a file.

```bash
wp-api-cli -s https://example.com describe > api-description.txt
```

Get more info about a command
-----------------------------

Want to see arguments accepted by a command or the routes it maps to?

Easy, just ask for it:

```bash
$ wp-api-cli -s https://example.com info posts

INFO: Using OAuth authentication.
INFO:
INFO: Route: /wp/v2/posts
INFO:   Path arguments (required):
INFO:   Arguments for GET:
INFO:     --context
INFO:     --page
INFO:     --per_page
INFO:     --filter
INFO:   Arguments for POST:
INFO:     --date: The date the object was published.
INFO:     --date_gmt: The date the object was published, as GMT.
INFO:     --modified: The date the object was last modified.
INFO:     --modified_gmt: The date the object was last modified, as GMT.
INFO:     --password: A password to protect access to the post.
INFO:     --slug: An alphanumeric identifier for the object unique to its type.
INFO:     --status: A named status for the object.
INFO:     --title: The title for the object.
INFO:     --content: The content for the object.
INFO:     --author: The ID for the author of the object.
INFO:     --excerpt: The excerpt for the object.
INFO:     --featured_image: ID of the featured image for the object.
INFO:     --comment_status: Whether or not comments are open on the object.
INFO:     --ping_status: Whether or not the object can be pinged.
INFO:     --format: The format for the object.
INFO:     --sticky: Whether or not the object should be treated as sticky.
INFO:
INFO: Route: /wp/v2/posts/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --date: The date the object was published.
INFO:     --date_gmt: The date the object was published, as GMT.
INFO:     --modified: The date the object was last modified.
INFO:     --modified_gmt: The date the object was last modified, as GMT.
INFO:     --password: A password to protect access to the post.
INFO:     --slug: An alphanumeric identifier for the object unique to its type.
INFO:     --status: A named status for the object.
INFO:     --title: The title for the object.
INFO:     --content: The content for the object.
INFO:     --author: The ID for the author of the object.
INFO:     --excerpt: The excerpt for the object.
INFO:     --featured_image: ID of the featured image for the object.
INFO:     --comment_status: Whether or not comments are open on the object.
INFO:     --ping_status: Whether or not the object can be pinged.
INFO:     --format: The format for the object.
INFO:     --sticky: Whether or not the object should be treated as sticky.
INFO:   Arguments for DELETE:
INFO:     --force
```

(!) This will only work with commands fetched from the API description.

Posts (`posts`)
---------------

### List all Posts

```bash
wp-api-cli -s https://example.com posts
```

### Create a Post

```bash
wp-api-cli -s https://example.com -X POST posts \
	--title "Hello, WP-API"                     \
	--content_file hello-wp-api.html
```

### Fetch a Post

```bash
wp-api-cli -s https://example.com posts --id 2
```

### Update a Post

```bash
wp-api-cli -s https://example.com posts -X PUT --id 2 \
	--title "Hello, dear WP-API"
```

### Delete a Post

```bash
wp-api-cli -s https://example.com posts -X DELETE --id 2
```

Meta for a Post (`posts_meta`)
------------------------------

### List all Meta for a Post

```bash
wp-api-cli -s https://example.com posts_meta --parent_id 2
```

### Create a Meta for a Post

```bash
wp-api-cli -s https://example.com posts_meta -X POST \
    --parent_id 2                                    \
	--key ListeningTo                                \
	--value "My Music"
```

### Fetch a Meta for a Post

(!) Not working. See [WP-API/WP-API: Can't read a specific Meta for a Post](https://github.com/WP-API/WP-API/issues/1494).

```bash
wp-api-cli -s https://example.com posts_meta \
	--parent_id 2                            \
	--id 5
```

### Update a Meta for a Post

```bash
wp-api-cli -s https://example.com posts_meta -X PUT \
	--parent_id 2                                   \
	--id 5                                          \
	--value "My Awesome Value"
```

### Delete a Meta for a Post

(!) Not working. See "[WP-API/WP-API: Can't delete Meta for a Post](https://github.com/WP-API/WP-API/issues/1495)".

```bash
wp-api-cli -s https://example.com posts_meta -X DELETE \
	--parent_id 2                                      \
	--id 5
```

Revisions for a Post (`posts_revisions`)
----------------------------------------

### List Revisions for a Post

```bash
wp-api-cli -s https://example.com posts_revisions \
	--parent_id 2
```

### Fetch a Revision for a Post

(!) Not working. See "[WP-API/WP-API: Can't read specific Revision for a Post](https://github.com/WP-API/WP-API/issues/1498)".

```bash
wp-api-cli -s https://example.com posts_revisions \
	--parent_id 2                                 \
	--id 5
```

### Create a Revision for a Post

Just update a post (see `posts` command), WordPress will create a Revision for it.

### Delete a Revision for a Post

```bash
wp-api-cli -s https://example.com posts_revisions -X DELETE \
	--parent_id 2                                           \
	--id 5
```

Media (`media`)
---------------

### List all Medias

```bash
wp-api-cli -s https://example.com media
```

### Create a Media

A Media is made of metadata and a file attachment.

The file attachment may be set by options:

1. `attachment`: Set the file to be loaded as an attachment.
2. `attachment_name`: Optional. Set the resulting file name in the server. If set, you **must** set `attachment_type` too.
3. `attachment_type`: Optional. Set the Content-Type of the attachment. If set, you **must** set `attachment_name` too.

```bash
wp-api-cli -s https://example.com media -X POST \
	--alt_text "A picture of myself"            \
	--attachment TheMedia.png
```

### Fetch a Media

```bash
wp-api-cli -s https://example.com media \
	--id 2
```

### Update a Media

```bash
wp-api-cli -s https://example.com media -X PUT \
	--id 2                                     \
	--caption "That's me"
```

### Delete a Media

(!) This is not working. See "[WP-API/WP-API: Can't delete Media](https://github.com/WP-API/WP-API/issues/1493)".

```bash
wp-api-cli -s https://example.com media -X DELETE \
	--id 2                                        \
	--force true
```

Taxonomies (`taxonomies`)
-------------------------

### List all Taxonomies

```bash
wp-api-cli -s https://example.com taxonomies
```

### Fetch a Taxonomy

```bash
wp-api-cli -s https://example.com taxonomies \
	--taxonomy category
```
