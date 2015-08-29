`posts_revisions`
=================

Info
----

```
$ wp-api-cli info posts_revisions

INFO: Route: /wp/v2/posts/(?P<parent_id>[\d]+)/revisions
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:   Arguments for GET:
INFO:     --context
INFO:
INFO: Route: /wp/v2/posts/(?P<parent_id>[\d]+)/revisions/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for DELETE:
```

List all Revisions of a Post
----------------------------

```
wp-api-cli posts_revisions --parent_id 6
```

Read a Revision of a Post
-------------------------

```
wp-api-cli posts_revisions --parent_id 6 --id 34
```

Delete a Revision of a Post
---------------------------

```
wp-api-cli posts_revisions -X DELETE --parent_id 6 --id 34
```
