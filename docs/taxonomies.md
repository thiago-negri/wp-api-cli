`taxonomies`
============

Info
----

```
$ wp-api-cli info taxonomies

INFO: Route: /wp/v2/taxonomies
INFO:   Arguments for GET:
INFO:     --post_type
INFO:
INFO: Route: /wp/v2/taxonomies/(?P<taxonomy>[\w-]+)
INFO:   Path arguments (required):
INFO:     --taxonomy
INFO:   Arguments for GET:
```

List all Taxonomies
-------------------

```
wp-api-cli taxonomies
```

Read a Taxonomy
---------------

```
wp-api-cli taxonomies --taxonomy post_tag
```
