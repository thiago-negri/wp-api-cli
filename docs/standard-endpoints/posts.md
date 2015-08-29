`posts`
=======

Info
----

```
$ wp-api-cli info posts

INFO: Route: /wp/v2/posts
INFO:   Arguments for GET:
INFO:     --context.............: Defines which properties to project (Accepts view, embed, edit)
INFO:     --page................: Number of page to load
INFO:     --per_page............: Quantity of posts to fetch per page
INFO:     --filter..............: Filter to apply to the query
INFO:   Arguments for POST:
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published, as GMT.
INFO:     --modified............: The date the object was last modified.
INFO:     --modified_gmt........: The date the object was last modified, as GMT.
INFO:     --password............: A password to protect access to the post.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --status..............: A named status for the object.
INFO:     --title...............: The title for the object.
INFO:     --content.............: The content for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --excerpt.............: The excerpt for the object.
INFO:     --featured_image......: ID of the featured image for the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --format..............: The format for the object.
INFO:     --sticky..............: Whether or not the object should be treated as sticky.
INFO:
INFO: Route: /wp/v2/posts/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published, as GMT.
INFO:     --modified............: The date the object was last modified.
INFO:     --modified_gmt........: The date the object was last modified, as GMT.
INFO:     --password............: A password to protect access to the post.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --status..............: A named status for the object.
INFO:     --title...............: The title for the object.
INFO:     --content.............: The content for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --excerpt.............: The excerpt for the object.
INFO:     --featured_image......: ID of the featured image for the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --format..............: The format for the object.
INFO:     --sticky..............: Whether or not the object should be treated as sticky.
INFO:   Arguments for DELETE:
INFO:     --force
```

List all Posts
--------------

```
wp-api-cli posts
```

Search Posts
------------

```
wp-api-cli posts --filter dict:s=JavaScript
```

Create a Post
-------------

```
wp-api-cli posts -X POST                \
	--sticky true                       \
	--title "Hello, WordPress"          \
	--content file:hello-wordpress.html
```

Read a Post
-----------

```
wp-api-cli posts --id 60
```

Update a Post
-------------

```
wp-api-cli posts -X PUT --id 60 --sticky false
```

Trash a Post
------------

```
wp-api-cli posts -X DELETE --id 60
```

Delete a Post
-------------

```
wp-api-cli posts -X DELETE --id 60 --force true
```
