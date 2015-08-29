`media`
=======

Info
----

```
$ wp-api-cli info media

INFO: Route: /wp/v2/media
INFO:   Arguments for GET:
INFO:     --context
INFO:     --page
INFO:     --per_page
INFO:     --filter
INFO:   Arguments for POST:
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published, as GMT.
INFO:     --modified............: The date the object was last modified.
INFO:     --modified_gmt........: The date the object was last modified, as GMT.
INFO:     --password............: A password to protect access to the post.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --status..............: A named status for the object.
INFO:     --title...............: The title for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --alt_text............: Alternative text to display when attachment is not displayed.
INFO:     --caption.............: The caption for the attachment.
INFO:     --description.........: The description for the attachment.
INFO:     --post................: The ID for the associated post of the attachment.
INFO:
INFO: Route: /wp/v2/media/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --date................: The date the object was published.
INFO:     --date_gmt............: The date the object was published, as GMT.
INFO:     --modified............: The date the object was last modified.
INFO:     --modified_gmt........: The date the object was last modified, as GMT.
INFO:     --password............: A password to protect access to the post.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --status..............: A named status for the object.
INFO:     --title...............: The title for the object.
INFO:     --author..............: The ID for the author of the object.
INFO:     --comment_status......: Whether or not comments are open on the object.
INFO:     --ping_status.........: Whether or not the object can be pinged.
INFO:     --alt_text............: Alternative text to display when attachment is not displayed.
INFO:     --caption.............: The caption for the attachment.
INFO:     --description.........: The description for the attachment.
INFO:     --post................: The ID for the associated post of the attachment.
INFO:   Arguments for DELETE:
INFO:     --force
```

List all Media
--------------

```
wp-api-cli media
```

Create a Media
--------------

```
wp-api-cli media                                   \
 	-X POST                                        \
	--slug my-picture                              \
	--title "My Picture"                           \
	--alt_text "Picture of Thiago Negri"           \
	--caption "A picture of me"                    \
	--description "A nice picture with a nice guy" \
	--attachment MyPicture.png
```

Read a Media
------------

```
wp-api-cli media --id 59
```

Update a Media
--------------

```
wp-api-cli media                  \
 	-X PUT                        \
	--id 59                       \
	--title "A Picture of Myself"
```

Delete a Media
--------------

```
wp-api-cli media -X DELETE --id 59
```
