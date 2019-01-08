"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _commander = _interopRequireDefault(require("commander"));

var _backup = _interopRequireDefault(require("./backup"));

var _restore = _interopRequireDefault(require("./restore"));

var _getWorkingDirectory = _interopRequireDefault(require("./lib/getWorkingDirectory"));

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

const defaultFileName = '.metadata.json';

_commander.default.version('1.0.2', '-v, --version');

_commander.default.command('restore [directory]').description('restore metadata to files').option('-r, --recursive', 'recursive').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored').action(async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    const filename = options.fileName || defaultFileName;

    try {
      const stat = await _fs.promises.stat(_path.default.join(workingDirectory, filename));

      if (stat.isFile()) {
        await (0, _restore.default)(workingDirectory, filename, options.recursive);
      } else {
        console.error(`${filename} is not a file`);
        process.exit(1);
      }
    } catch (e) {
      console.error(`${filename} not found`);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
});

_commander.default.command('backup [directory]').description('backup metadata').option('-r, --recursive', 'recursive').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored').action(async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    const filename = options.fileName || defaultFileName;
    await (0, _backup.default)(workingDirectory, filename, options.recursive);
  } else {
    process.exit(1);
  }
});

_commander.default.command('*').action(env => {
  _commander.default.outputHelp();

  process.exit(1);
});

_commander.default.parse(process.argv);