`terms_category`
================

Info
----

```
$ wp-api-cli info terms_category

INFO: Route: /wp/v2/terms/category
INFO:   Arguments for GET:
INFO:     --page
INFO:     --per_page
INFO:     --search
INFO:     --order
INFO:     --orderby
INFO:     --parent..............: The ID for the parent of the object.
INFO:   Arguments for POST:
INFO:     --description.........: A human-readable description of the object.
INFO:     --name................: The title for the object.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --parent..............: The ID for the parent of the object.
INFO:
INFO: Route: /wp/v2/terms/category/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --description.........: A human-readable description of the object.
INFO:     --name................: The title for the object.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --parent..............: The ID for the parent of the object.
INFO:   Arguments for DELETE:
```

List Categories
---------------

```
wp-api-cli terms_category
```

Create a Category
-----------------

```
wp-api-cli terms_category -X POST                       \
	--slug reality-check                                \
	--name "Reality Check"                              \
	--description "Texts where I try to assess reality"
```

Read a Category
---------------

```
wp-api-cli terms_category --id 4
```

Update a Category
-----------------

```
wp-api-cli terms_category -X PUT                 \
	--id 4                                       \
	--description "Texts where I assess reality"
```

Delete a Category
-----------------

```
wp-api-cli terms_category -X DELETE --id 4
```
