# Common Django-NextJS Project

## Backend

**Before** any user registration is done, a few commands must be executed in order to setup the database initial data:

```
python3 manage.py seed_roles
```

### Configuration file

To select the configuration file to be used the environment variable `DJANGO_SETTINGS_MODULE` must be set to one of the defined configuration files depending on the environment:

- `config.django.base`: **default configuration file**, contains most of the settings & imports everything else from config/settings
- `config.django.local`: imports from base.py and can overwrite some specific settings for local development.
- `config.django.production`: imports from base.py and then overwrites some specific settings for production

Another option to set the configuration file to be used instead of setting it through the environment variable is is to hardcode it in the `manage.py`, `asgi.py` and `wsgi.py` files.

### Environment Variables

Environment variables can be prefixed by setting the value of `env.prefix` to the prefix to use in the `config/env.py` file.

### Commands

- `seed_roles`: Seed the database with the default user groups/roles.
- `add_to_whitelist`: Adds a user to the whitelist or updates the group of an existing user.
    - args:
        - email: str
        - role/group: str, if a incorrect value is given, the command will show available options.
    - flags: 
        - --buyer_alias: str, optional
- `remove_from_whitelist`: Removes a user from the whitelist and deletes the user if it exists.
    - args:
        - email: str
- `create_user`: Create a new user without automatically sending a verification email
    - args:
        - email: str
    - optional args:
        - -u, --username: str
        - -f, --first_name: str
        - -l, --last_name: str
        - -r, --roles: str list
    - flags:
        - --pw: prompt password creation
        - --verified: marks the user as verified
        - --super: sets is_superuser to True
        - --staff: sets is_staff to True
- `delete_user`: Deletes a user given an email.

### Shell autoreload

Python shell with automatic module autoreload:

- Install IPython: `pip install Ipython` (already in the requirements/local.txt file)
- Start Django shell: `python manage.py shell`
- Input the following commands to enable autoreload:
    - `%load_ext autoreload`
    - `%autoreload 2`

[IPython autoreload docs](https://ipython.org/ipython-doc/3/config/extensions/autoreload.html)

### OpenAPI

Generate scheme: `python manage.py spectacular --color --file schema.yml`

---

Some of the code style decisions are inspired from the [Django Styleguide used in HackSoftware](https://github.com/HackSoftware/Django-Styleguide) with some modifications.

## Frontend

TODO