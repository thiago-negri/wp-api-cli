Commands
========

See all available arguments and commands by reading the help.

```bash
wp-api-cli --help
```

Basic options
-------------

- `--insecure` or `-k` lets you connect to insecure sites (e.g. with self-signed certificates).
- `--site` or `-s` will set the site to connect to.
- `--method` or `-X` defines the HTTP verb to use in the request, defaults to `GET`.

Helpers
-------

These options are not in the API, they only exist in the CLI to help you.

- `--attachment` let you set a file to send as an attachment of the request, needed to create Media. See also `--attachment_type` and `--attachment_name`.

Prefixes
--------

All options allow the use of special prefixes to change how it's handled by the CLI.

### File Prefix

To set the content of an option as the content of a file, just prefix the file name with `file:`.
For example, to set the option "foo" to be the content of file "bar.txt":

```bash
wp-api-cli command --foo file:bar.txt
```

### Dict Prefix

To set an option as a dictionary, use prefix `dict:`.

A dictionary is handled as a named array in query parameters. For example:

```bash
wp-api-cli posts --filter dict:s=foo
# > GET https://example.com/wp-json/wp/v2/posts?filter[s]=foo
```

When sent as body, it will be an embedded JSON object.

### Text Prefix

To let you use a special prefix as the actual content of an option, you may prefix the option with `text:`.
For example, to set the option "foo" to "file:bar.txt":

```bash
wp-api-cli --foo text:file:bar.txt
```

Update CLI definitions
----------------------

The first command you should run is `update` to make sure you have the latest API description from your site.

```bash
wp-api-cli update https://example.com
```

After updating the CLI definitions, it will default to use the site from the API description, but you can change it
by passing `--site` or `-s` at each command.

Describe the API
----------------

Outputs a description of the API. As it is a big JSON, it is easier to see if you output it to a file.

```bash
wp-api-cli describe > api-description.txt
```

Get more info about a command
-----------------------------

Want to see arguments accepted by a command or the routes it maps to?

Easy, just ask for it:

```bash
wp-api-cli posts -h
```

Example output:

```
  Usage: posts [options]

  "/wp/v2/posts", "/wp/v2/posts/(?P<id>[\d]+)"

  Options:

    -h, --help                output usage information
    --context <value>         Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --page <value>            Used by "/wp/v2/posts"
    --per_page <value>        Used by "/wp/v2/posts"
    --filter <value>          Used by "/wp/v2/posts"
    --date <value>            Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --date_gmt <value>        Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --modified <value>        Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --modified_gmt <value>    Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --password <value>        Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --slug <value>            Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --status <value>          Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --title <value>           Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --content <value>         Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --author <value>          Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --excerpt <value>         Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --featured_image <value>  Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --comment_status <value>  Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --ping_status <value>     Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --format <value>          Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --sticky <value>          Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --id <value>              Used by "/wp/v2/posts/(?P<id>[\d]+)"
    --force <value>           Used by "/wp/v2/posts/(?P<id>[\d]+)"
```

Commands
--------

The standard WP-API endpoints are documented in separate files. Take a look at [standard-endpoints](standard-endpoints/) folder, each command has a file there.
