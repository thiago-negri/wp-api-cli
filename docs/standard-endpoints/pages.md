`pages`
=======

Info
----

```
$ wp-api-cli info pages

INFO: Route: /wp/v2/pages
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
INFO:     --parent..............: The ID for the parent of the object.
INFO:     --title...............: The title for the object.
INFO:     --content.............: The content for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --excerpt.............: The excerpt for the object.
INFO:     --featured_image......: ID of the featured image for the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --menu_order..........: The order of the object in relation to other object of its type.
INFO:     --template............: The theme file to use to display the object.
INFO:
INFO: Route: /wp/v2/pages/(?P<id>[\d]+)
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
INFO:     --parent..............: The ID for the parent of the object.
INFO:     --title...............: The title for the object.
INFO:     --content.............: The content for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --excerpt.............: The excerpt for the object.
INFO:     --featured_image......: ID of the featured image for the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --menu_order..........: The order of the object in relation to other object of its type.
INFO:     --template............: The theme file to use to display the object.
INFO:   Arguments for DELETE:
INFO:     --force
```

List all Pages
--------------

```
wp-api-cli pages
```

Search for a Page
-----------------

```
wp-api-cli pages --filter dict:s=Profile
```

Create a Page
-------------

```
wp-api-cli pages -X POST        \
	--slug profile              \
	--title Profile             \
	--content file:profile.html
```

Read a Page
-----------

```
wp-api-cli pages --id 62
```

Update a Page
-------------

```
wp-api-cli pages -X PUT  \
	--id 62              \
	--title "My Profile"
```

Trash a Page
------------

```
wp-api-cli pages -X DELETE --id 62
```

Delete a Page
-------------

```
wp-api-cli pages -X DELETE --id 62 --force true
```
