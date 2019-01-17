"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _commander = _interopRequireDefault(require("commander"));

var _fs = require("fs");

var _backup = _interopRequireDefault(require("./backup"));

var _restore = _interopRequireDefault(require("./restore"));

var _getWorkingDirectory = _interopRequireDefault(require("./lib/getWorkingDirectory"));

var _getMetadata = _interopRequireDefault(require("./lib/getMetadata"));

var _package = require("./../package");

_commander.default.version(_package.version, '-v, --version').name('metadata').description('Backup and restore metadata to files').usage('[commands] [options] directory');

_commander.default.command('restore [directory]').description('Updates files with previously stored metadata from [filename]').option('-r, --recursive', 'recursive').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored. Default ".metadata"').action(async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    const {
      metadata
    } = await (0, _getMetadata.default)(workingDirectory, options.filename);

    if (metadata != null) {
      await (0, _restore.default)(workingDirectory, metadata, options.recursive);
    } else {
      process.exit(1);
    }
  } else {
    console.error(`directory [${workingDirectory}] not found`);
    process.exit(1);
  }
});

_commander.default.command('backup [directory]').description('Reads metadata of files and store this in a file [filename]').option('-r, --recursive', 'recursive').option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored. Default ".metadata"').action(async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    const {
      metadataFN,
      metadata
    } = await (0, _getMetadata.default)(workingDirectory, options.filename);
    const metadataNew = await (0, _backup.default)(workingDirectory, metadata, options.recursive);
    console.info(`write metadata to ${metadataFN}`);
    await _fs.promises.writeFile(metadataFN, JSON.stringify(metadataNew));
  } else {
    console.error(`directory ${workingDirectory} not found`);
    process.exit(1);
  }
});

_commander.default.command('help').action(env => {
  _commander.default.outputHelp();
});

_commander.default.parse(process.argv);