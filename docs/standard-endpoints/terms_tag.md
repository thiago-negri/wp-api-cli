`terms_tag`
===========

Info
----

```
$ wp-api-cli info terms_tag

INFO: Route: /wp/v2/terms/tag
INFO:   Arguments for GET:
INFO:     --page................: Current page of the collection.
INFO:     --per_page............: Maximum number of items to be returned in result set.
INFO:     --search..............: Limit results to those matching a string.
INFO:     --order...............: Order sort attribute ascending or descending.
INFO:     --orderby.............: Sort collection by object attribute.
INFO:   Arguments for POST:
INFO:     --description.........: A human-readable description of the object.
INFO:     --name................: The title for the object.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:
INFO: Route: /wp/v2/terms/tag/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --description.........: A human-readable description of the object.
INFO:     --name................: The title for the object.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:   Arguments for DELETE:
```

List tags
---------

```
wp-api-cli terms_tag
```

Search for a tag
----------------

```
wp-api-cli terms_tag --search script
```

Create a tag
------------

```
wp-api-cli terms_tag                       \
	-X POST                                \
	--name JavaScript                      \
	--slug javascript                      \
	--description "Rants about JavaScript"
```

Read a tag
----------

```
wp-api-cli terms_tag --id 2
```

Update a tag
------------

```
wp-api-cli terms_tag                       \
	-X PUT                                 \
	--id 2                                 \
	--description "Texts about JavaScript"
```

Delete a tag
------------

```
wp-api-cli terms_tag                       \
	-X DELETE                              \
	--id 2
```
