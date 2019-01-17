# metadata
Backup and restore metadata of files.
ie to be able to store tags of files in a git repository.

## Install

```
Install node from https://nodejs.org

$ npm install -g @ogim/metadata
```

## Usage

```
$ metadata --help
Usage: metadata [commands] [options] directory

Backup and restore metadata to files

Options:
  -v, --version                  output the version number
  -h, --help                     output usage information

Commands:
  restore [options] [directory]  restore metadata to files
  backup [options] [directory]   backup metadata




$ metadata restore --help
Usage: restore [options] [directory]

Updates files with previously stored metadata from [filename]

Options:
  -r, --recursive            recursive
  -f, --filename <fileName>  optionally supply the filename where the metadata is stored. Default ".metadata"
  -h, --help                 output usage information




$ metadata backup --help
Usage: backup [options] [directory]

Reads metadata of files and store this in a file default ".metadata"

Options:
  -r, --recursive            recursive
  -f, --filename <fileName>  optionally supply the filename where the metadata is stored. Default ".metadata"
  -h, --help                 output usage information
```




## Examples

```
    $ metadata backup -r

```
