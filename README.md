# metadata
Backup and restore metadata of files.
ie to be able to store tags of files in a git repository.

Sorry, MAC only ...

## Install

```
Install node from https://nodejs.org

$ sudo npm install -g @ogim/metadata
```

## Examples

```
    recursively backup tags, by default in current dirctory
    $ metadata backup -r
    $ metadata backup -r ~/bling/blah
    $ metadata backup -r ./bling/

    recursively restore tags, by default in current dirctory
    $ metadata restore -r
    $ metadata restore -r ~/bling/blah
    $ metadata restore -r ./bling/

    get some help
    $ metadata --help
    $ metadata backup --help
    $ metadata restore --help

```

## GIT Hooks

./git/hooks/pre-commit
```bash
    #!/usr/bin/env bash

    PATH=$PATH:/usr/local/bin:/usr/local/sbin
    metadata backup -r ./src
```


./git/hooks/post-checkout
```bash
    #!/usr/bin/env bash

    PATH=$PATH:/usr/local/bin:/usr/local/sbin
    metadata restore -r ./src
```




