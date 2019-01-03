#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _plist = _interopRequireDefault(require("plist"));

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _atob = _interopRequireDefault(require("atob"));

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _cmd = _interopRequireDefault(require("./lib/cmd"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadataXattr = async (metadata, filename, filenameRelative) => {
  //const tags = await cmd('xattr', [filename]);
  console.info('  ', filenameRelative);
  const attributes = metadata.find(entry => {
    return entry.filename === filenameRelative;
  });

  if (!attributes) {
    return false;
  } // clear all attributes


  await (0, _cmd.default)('xattr', ['-c', filename]); // set attributes

  for (const attr of attributes.data) {
    const [attrName, attrValue] = attr;
    console.info('   **', attrName);
    await (0, _cmd.default)('xattr', ['-wx', attrName, (0, _atob.default)(attrValue), filename]);
  }

  return true;
};
/**
 *
 * @param dir
 * @param filename
 * @param isRecursive
 * @returns {Promise<void>}
 */


var _default = async (rootDir, filename, isRecursive = false) => {
  const metadata = await _fs.promises.readFile(_path.default.join(rootDir, filename));

  try {
    const metadataJSON = JSON.parse(metadata.toString());
    const info = await (0, _fileList.default)(rootDir, getMetadataXattr.bind(null, metadataJSON), {
      isRecursive
    });
  } catch (e) {
    console.error('invalid metadata', e);
    process.exit(1);
  }
};

exports.default = _default;