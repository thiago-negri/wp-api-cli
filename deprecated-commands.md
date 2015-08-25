Commands (deprecated)
---------------------

Here we list all commands available. If you are trying to delete something and receive an error that the object can't be trashed, you may force the delete by using `--force` option.

### Help

See all available arguments and commands by reading the help.

```bash
wp-api-cli --help
```

### Describe the API

It is easier to see if you output it to a file.

```bash
wp-api-cli -s https://example.com describe > api-description.txt
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

### List all Meta for a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	meta_list
```

### Create a Meta for a Post

#### From file

To create a new Meta for a Post from a file, use `meta_json` argument to point to the file.
The file content should be a JSON with the [schema expected from WP-API endpoint](http://v2.wp-api.org/#meta-for-a-post).

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--meta_json meta.json
	meta_create
```

#### From command line

You may create a new Meta for a Post from the command line, by using the `meta_*` arguments.

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--meta_key ListeningTo \
	--meta_value "My Music" \
	meta_create
```

### Fetch a Meta for a Post

(!) Not working. See [WP-API/WP-API: Can't read a specific Meta for a Post](https://github.com/WP-API/WP-API/issues/1494).

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--meta_id 5 \
	meta_get
```

### Update a Meta for a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--meta_id 5 \
	--meta_value "My Awesome Value" \
	meta_update
```

### Delete a Meta for a Post

(!) Not working. See "[WP-API/WP-API: Can't delete Meta for a Post](https://github.com/WP-API/WP-API/issues/1495)".

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--meta_id 5 \
	meta_delete
```

### List Revisions for a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	revision_list
```

### Fetch a Revision for a Post

(!) Not working. See "[WP-API/WP-API: Can't read specific Revision for a Post](https://github.com/WP-API/WP-API/issues/1498)".

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--revision_id 5 \
	revision_get
```

### Create a Revision for a Post

Just update a post (see `post_update` command), WordPress will create a Revision for it.

### Delete a Revision for a Post

```bash
wp-api-cli -s https://example.com \
	--post_id 2 \
	--revision_id 5 \
	revision_delete
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

(!) This is not working. See "[WP-API/WP-API: Can't delete Media](https://github.com/WP-API/WP-API/issues/1493)".

```bash
wp-api-cli -s https://example.com \
	--media_id 2 \
	media_delete
```

### List all Comments

```bash
wp-api-cli -s https://example.com comment_list
```

### List all Comments of a Post

```bash
wp-api-cli -s https://example.com \
	--comment_post 2 \
	comment_list
```

### Fetch a Comment

```bash
wp-api-cli -s https://example.com \
	--comment_id 1 \
	comment_get
```

### Create a Comment

#### From file

To create a new Comment from a file, use `comment_json` argument to point to the file.
The file content should be a JSON with the [schema expected from WP-API endpoint](http://v2.wp-api.org/#comments).

```bash
wp-api-cli -s https://example.com \
	--comment_json comment.json
	comment_create
```

#### From command line

You may create a new Comment from the command line, by using the `comment_*` arguments.

```bash
wp-api-cli -s https://example.com \
	--comment_post 2 \
	--comment_content "Cool text, bro!" \
	comment_create
```

### Update a Comment

```bash
wp-api-cli -s https://example.com \
	--comment_id 5 \
	--comment_content "Cool text, friend!" \
	comment_update
```

### Delete a Comment

```bash
wp-api-cli -s https://example.com \
	--comment_id 5 \
	comment_delete
```

### List all Taxonomies

```bash
wp-api-cli -s https://example.com taxonomy_list
```

### Fetch a Taxonomy

```bash
wp-api-cli -s https://example.com \
	--taxonomy_slug="category" \
	taxonomy_get
```
