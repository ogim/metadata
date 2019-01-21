"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _commander = _interopRequireDefault(require("commander"));

var _backup = _interopRequireDefault(require("./backup"));

var _restore = _interopRequireDefault(require("./restore"));

var _package = require("../package");

_commander.default.version(_package.version, '-v, --version').name('metadata').description('Backup and restore metadata to files').usage('[commands] [options] directory');

_commander.default.command('restore [directory]').description('Updates files with previously stored metadata from [filename]').option('-r, --recursive', 'recursive').option('-a, --alltags', 'process all extended attributes and not only tags').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored. Default ".metadata"').action(_restore.default);

_commander.default.command('backup [directory]').description('Reads metadata of files and store this in a file [filename]').option('-r, --recursive', 'recursive').option('-a, --alltags', 'process all extended attributes and not only tags').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored. Default ".metadata"').action(_backup.default);

_commander.default.command('help').action(env => {
  _commander.default.outputHelp();
});

_commander.default.parse(process.argv);