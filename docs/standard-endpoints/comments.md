`comments`
==========

Info
----

```
$ wp-api-cli info comments

INFO: Route: /wp/v2/comments
INFO:   Arguments for GET:
INFO:     --page................: Current page of the collection.
INFO:     --per_page............: Maximum number of items to be returned in result set.
INFO:     --search..............: Limit results to those matching a string.
INFO:     --author_email........: Limit result set to that from a specific author email.
INFO:     --karma...............: Limit result set to that of a particular comment karma.
INFO:     --parent..............: Limit result set to that of a specific comment parent id.
INFO:     --post................: Limit result set to comments assigned to a specific post id.
INFO:     --post_author.........: Limit result set to comments associated with posts of a specific post author id.
INFO:     --post_slug...........: Limit result set to comments associated with posts of a specific post slug.
INFO:     --post_parent.........: Limit result set to comments associated with posts of a specific post parent id.
INFO:     --post_status.........: Limit result set to comments associated with posts of a specific post status.
INFO:     --post_type...........: Limit result set to comments associated with posts of a specific post type.
INFO:     --status..............: Limit result set to comments assigned a specific status.
INFO:     --type................: Limit result set to comments assigned a specific type.
INFO:     --user................: Limit result set to comments assigned to a specific user id.
INFO:   Arguments for POST:
INFO:     --author..............: The ID of the user object, if author was a user.
INFO:     --author_email........: Email address for the object author.
INFO:     --author_name.........: Display name for the object author.
INFO:     --author_url..........: URL for the object author.
INFO:     --content.............: The content for the object.
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published as GMT.
INFO:     --karma...............: Karma for the object.
INFO:     --parent..............: The ID for the parent of the object.
INFO:     --post................: The ID of the associated post object.
INFO:     --status..............: State of the object.
INFO:     --type................: Type of Comment for the object.
INFO:
INFO: Route: /wp/v2/comments/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --author..............: The ID of the user object, if author was a user.
INFO:     --author_email........: Email address for the object author.
INFO:     --author_name.........: Display name for the object author.
INFO:     --author_url..........: URL for the object author.
INFO:     --content.............: The content for the object.
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published as GMT.
INFO:     --karma...............: Karma for the object.
INFO:     --parent..............: The ID for the parent of the object.
INFO:     --post................: The ID of the associated post object.
INFO:     --status..............: State of the object.
INFO:     --type................: Type of Comment for the object.
INFO:   Arguments for DELETE:
INFO:     --force
```

List all Comments
-----------------

```
wp-api-cli comments
```

Search Comments
---------------

```
wp-api-cli comments --search awesome
```

Create a Coment
---------------

```
wp-api-cli comments -X POST              \
	--post 6                             \
	--author_name "Mouse Lover"          \
	--content "I'd prefer a visual tool" 
```

Read a Comment
--------------

```
wp-api-cli comments --id 3
```

Update a Comment
----------------

```
wp-api-cli comments -X PUT         \
	--id 3                         \
	--author_name "Keyboard Hater"
```

Delete a Comment
----------------

```
wp-api-cli comments -X DELETE --id 3
```
