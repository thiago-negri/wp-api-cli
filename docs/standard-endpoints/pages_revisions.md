`pages_revisions`
=================

Info
----

```
$ wp-api-cli info pages_revisions

INFO: Route: /wp/v2/pages/(?P<parent_id>[\d]+)/revisions
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:   Arguments for GET:
INFO:     --context
INFO:
INFO: Route: /wp/v2/pages/(?P<parent_id>[\d]+)/revisions/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --parent_id
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for DELETE:
```

List all Revisions of a Page
----------------------------

```
wp-api-cli pages_revisions --parent_id 2
```

Read a Revision of a Page
-------------------------

```
wp-api-cli pages_revisions --parent_id 2 --id 64
```

Delete a Revision of a Page
---------------------------

```
wp-api-cli pages_revisions -X DELETE --parent_id 2 --id 64
```
