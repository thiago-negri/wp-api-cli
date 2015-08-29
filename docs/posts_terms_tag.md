`posts_terms_tag`
=================

Info
----

```
$ wp-api-cli info posts_terms_tag

INFO: Route: /wp/v2/posts/(?P<post_id>[\d]+)/terms/tag
INFO:   Path arguments (required):
INFO:     --post_id
INFO:   Arguments for GET:
INFO:     --order...............: Order sort attribute ascending or descending.
INFO:     --orderby.............: Sort collection by object attribute.
INFO:
INFO: Route: /wp/v2/posts/(?P<post_id>[\d]+)/terms/tag/(?P<term_id>[\d]+)
INFO:   Path arguments (required):
INFO:     --post_id
INFO:     --term_id
INFO:   Arguments for GET:
INFO:   Arguments for POST:
INFO:   Arguments for DELETE:
```

List tags of a post
-------------------

```
wp-api-cli posts_terms_tag --post_id 1
```

Read a tag of a post
--------------------

```
wp-api-cli posts_terms_tag --post_id 1 --term_id 2
```

Add a tag to a post
-------------------

```
wp-api-cli posts_terms_tag -X POST --post_id 1 --term_id 3
```

Remove a tag from a post
------------------------

```
wp-api-cli posts_terms_tag -X DELETE --post_id 1 --term_id 3 --force
```
