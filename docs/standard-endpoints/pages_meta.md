`pages_meta`
============

Info
----

```
$ wp-api-cli info pages_meta

INFO: Route: /wp/v2/pages/(?P<parent_id>[\d]+)/meta
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST:
INFO:     --key.................: The key for the custom field.
INFO:     --value...............: The value of the custom field.
INFO:
INFO: Route: /wp/v2/pages/(?P<parent_id>[\d]+)/meta/(?P<id>[\d]+)
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

List all Meta of a Page
-----------------------

```
wp-api-cli pages_meta --parent_id 3
```

Create a Meta for a Page
------------------------

```
wp-api-cli pages_meta -X POST \
	--parent_id 3             \
	--key Feeling             \
	--value Happy
```

Read a Meta of a Page
---------------------

```
wp-api-cli pages_meta --parent_id 3 --id 113
```

Update a Meta of a Page
-----------------------

```
wp-api-cli pages_meta -X PUT \
	--parent_id 3            \
	--id 113                 \
	--value happiness
```

Delete a Meta of a Page
-----------------------

```
wp-api-cli pages_meta -X DELETE --parent_id 3 --id 113 --force true
```
