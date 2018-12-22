#!/usr/bin/env node
"use strict";

var _optimist = _interopRequireDefault(require("optimist"));

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _fs = require("fs");

var _backup = _interopRequireDefault(require("./backup"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = _optimist.default.usage('backup or restore metadata.\nUsage: $0 [-r --backup/restore]').demand(0).describe('r', 'recursive').describe('restore', 'restores metadata').describe('backup', 'create a backup of metadata').boolean(['restore', 'backup', 'r']).argv;

let directory = argv._[0] || process.cwd();

(async () => {
  if (!(argv.restore && !argv.backup) && !(!argv.restore && argv.backup)) {
    console.info('Nothing to do, needs restore or backup command');
    argv.help();
    exit && process.exit(1);
  } // if (argv._.length !== 1 || typeof directory !== 'string') {
  // 	console.info('Needs a directory to process');
  // 	argv.help();
  // 	exit && process.exit(1)
  // }
  // replace tilde sign with homedir


  if (directory.substring(0, 1) === '~') {
    directory = directory.replace('~', _os.default.homedir());
  } // check if the directory is valid


  const stat = await _fs.promises.stat(directory);

  if (!stat.isDirectory()) {
    console.info('invalid directory', directory);
    argv.help();
    exit && process.exit(1);
  }

  console.log('directory:', directory);

  if (argv.backup) {
    await (0, _backup.default)(directory);
  } else if (argv.restore) {//await restore()
  } else {
    console.info('Nothing to do');
    argv.help();
  }
})();