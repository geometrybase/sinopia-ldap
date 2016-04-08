# sinopia-altldap

An simpler alternative to [sinopia-ldap](https://github.com/rlidwka/sinopia-ldap)
which doesn't require an ldap admin account.  If you can perform a bind
against the configured ldap url, you are granted access.


## Installation

```sh
$ npm install sinopia
$ npm install sinopia-altldap
```

## Config

Add to your `config.yaml`:

```yaml
auth:
  altldap:
    type: ldap
    domain: example.com
    client_options:
      url: "ldaps://ldap.example.com"
      tlsOptions:
        rejectUnauthorized: False
```

If the ```domain``` option is supplied it is appended to the username so that users don't have to type
the full ```<user>@<domain>``` to login.

```client_options``` are passed directly to [ldap.createClient](http://ldapjs.org/client.html#create-a-client).

## For plugin writers

It's called as:

```js
require('sinopia-altldap')(config, stuff)
```

Where:

 - config - module's own config
 - stuff - collection of different internal sinopia objects
   - stuff.config - main config
   - stuff.logger - logger

This should export two functions:

 - `adduser(user, password, cb)`
   
   It should respond with:
    - `cb(err)` in case of an error (error will be returned to user)
    - `cb(null, false)` in case registration is disabled (next auth plugin will be executed)
    - `cb(null, true)` in case user registered successfully
   
   It's useful to set `err.status` property to set http status code (e.g. `err.status = 403`).

 - `authenticate(user, password, cb)`
   
   It should respond with:
    - `cb(err)` in case of a fatal error (error will be returned to user, keep those rare)
    - `cb(null, false)` in case user not authenticated (next auth plugin will be executed)
    - `cb(null, [groups])` in case user is authenticated
   
   Groups is an array of all users/usergroups this user has access to. You should probably include username itself here.
   
