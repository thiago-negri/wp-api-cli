`users`
=======

Info
----

```
$ wp-api-cli info users
INFO: Route: /wp/v2/users
INFO:   Arguments for GET:
INFO:     --page
INFO:     --per_page
INFO:     --search
INFO:     --context
INFO:     --order
INFO:     --orderby
INFO:   Arguments for POST:
INFO:     --capabilities........: All capabilities assigned to the user.
INFO:     --description.........: Description of the object.
INFO:     --email...............: The email address for the object.
INFO:     --first_name..........: First name for the object.
INFO:     --last_name...........: Last name for the object.
INFO:     --name................: Display name for the object.
INFO:     --nickname............: The nickname for the object.
INFO:     --role................: Role assigned to the user.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --username............: Login name for the user.
INFO:     --password
INFO:
INFO: Route: /wp/v2/users/(?P<id>[\d]+)
INFO:   Path arguments (required):
INFO:     --id
INFO:   Arguments for GET:
INFO:     --context
INFO:   Arguments for POST, PUT, PATCH:
INFO:     --capabilities........: All capabilities assigned to the user.
INFO:     --description.........: Description of the object.
INFO:     --email...............: The email address for the object.
INFO:     --first_name..........: First name for the object.
INFO:     --last_name...........: Last name for the object.
INFO:     --name................: Display name for the object.
INFO:     --nickname............: The nickname for the object.
INFO:     --role................: Role assigned to the user.
INFO:     --slug................: An alphanumeric identifier for the object unique to its type.
INFO:     --username............: Login name for the user.
INFO:     --password
INFO:   Arguments for DELETE:
INFO:     --reassign
```

List Users
----------

```
wp-api-cli users
```

Create a User
-------------

```
wp-api-cli users -X POST       \
	--username tnegri          \
	--name "Thiago Negri"      \
	--password 123             \
	--slug thiago-negri        \
	--first_name Thiago        \
	--last_name Negri          \
	--email tnegri@example.com \
	--description "A nice guy"
```

Read a User
-----------

```
wp-api-cli users --id 2
```

Update a User
-------------

```
wp-api-cli users -X PUT \
	--id 2              \
	--password 456
```

Delete a User
-------------

```
wp-api-cli users -X DELETE --id 2 --force true
```
