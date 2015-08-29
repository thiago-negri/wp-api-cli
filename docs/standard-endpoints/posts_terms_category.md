`posts_terms_category`
======================

Info
----

```
$ wp-api-cli info posts_terms_category

INFO: Route: /wp/v2/posts/(?P<post_id>[\d]+)/terms/category
INFO:   Path arguments (required):
INFO:     --post_id
INFO:   Arguments for GET:
INFO:     --order
INFO:     --orderby
INFO:
INFO: Route: /wp/v2/posts/(?P<post_id>[\d]+)/terms/category/(?P<term_id>[\d]+)
INFO:   Path arguments (required):
INFO:     --post_id
INFO:     --term_id
INFO:   Arguments for GET:
INFO:   Arguments for POST:
INFO:   Arguments for DELETE:
INFO:     --force
```

List categories of a post
-------------------

```
wp-api-cli posts_terms_category --post_id 1
```

Read a category of a post
--------------------

```
wp-api-cli posts_terms_category --post_id 1 --term_id 5
```

Add a category to a post
-------------------

```
wp-api-cli posts_terms_category -X POST --post_id 1 --term_id 5
```

Remove a category from a post
------------------------

```
wp-api-cli posts_terms_category -X DELETE --post_id 1 --term_id 5 --force true
```
