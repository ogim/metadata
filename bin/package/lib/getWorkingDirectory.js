"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _fs = require("fs");

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _default = async (directory = process.cwd()) => {
  // replace tilde sign with homedir
  if (directory.substring(0, 1) === '~') {
    directory = directory.replace('~', _os.default.homedir());
  } else if (directory.substring(0, 1) === '.') {
    directory = _path.default.join(process.cwd(), directory);
  } // check if the directory is valid


  try {
    const stat = await _fs.promises.stat(directory);

    if (!stat.isDirectory()) {
      throw new Error('path is not a directory');
    }
  } catch (e) {
    console.info('invalid directory', directory);

    _commander.default.outputHelp();

    process.exit(1);
  } // uniform dir to end on /


  directory = _path.default.join(directory, '/');
  return directory;
};

exports.default = _default;