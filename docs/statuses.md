`statuses`
==========

Info
----

```
$ wp-api-cli info statuses
INFO: Route: /wp/v2/statuses
INFO:   Arguments for GET:
INFO:
INFO: Route: /wp/v2/statuses/(?P<status>[\w-]+)
INFO:   Path arguments (required):
INFO:     --status
INFO:   Arguments for GET:
```

List Statuses
-------------

```
wp-api-cli statuses
```

Read a Status
-------------

```
wp-api-cli statuses --status private
```
