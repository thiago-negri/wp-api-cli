`posts_meta`
============

Info
----

```
$ wp-api-cli info posts_meta

INFO: Route: /wp/v2/posts/(?P<parent_id>[\d]+)/meta
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST:
INFO:     --key.................: The key for the custom field.
INFO:     --value...............: The value of the custom field.
INFO:
INFO: Route: /wp/v2/posts/(?P<parent_id>[\d]+)/meta/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --key.................: The key for the custom field.
INFO:     --value...............: The value of the custom field.
INFO:   Arguments for DELETE:
INFO:     --force
```

List all Meta of a Post
-----------------------

```
wp-api-cli posts_meta --parent_id 1
```

Create a new Meta for a Post
----------------------------

```
wp-api-cli posts_meta -X POST \
	--parent_id 6             \
	--key ListeningTo         \
	--value "Outside Weather"
```

Read a Meta of a Post
---------------------

```
wp-api-cli posts_meta --parent_id 6 --id 110
```

Update a Meta of a Post
-----------------------

```
wp-api-cli posts_meta -X PUT \
	--parent_id 6            \
	--id 110                 \
	--value "Outside Chaos"
```

Delete a Meta of a Post
-----------------------

```
wp-api-cli posts_meta -X DELETE --parent_id 6 --id 110 --force true
```
