"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _plist = _interopRequireDefault(require("plist"));

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _btoa = _interopRequireDefault(require("btoa"));

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _cmd = _interopRequireDefault(require("./lib/cmd"));

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadataXattr = async (filename, filenameRelative) => {
  console.info('  ', filenameRelative);
  const ATTRIBUTES = await (0, _cmd.default)('xattr', [filename]);
  const attributes = ATTRIBUTES && ATTRIBUTES.toString().split('\n');

  if (!attributes) {
    return [];
  } // read all attributes


  const data = [];

  for (const attrName of attributes) {
    if (attrName) {
      try {
        const attrValue = await (0, _cmd.default)('xattr', ['-px', attrName, filename]);
        console.info('   **', attrName);
        data.push([attrName, (0, _btoa.default)(attrValue)]);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return data;
};
/**
 *
 * @param dir
 * @param filename
 * @param isRecursive
 * @returns {Promise<void>}
 */


var _default = async (rootDir, filename, isRecursive = false) => {
  const info = await (0, _fileList.default)(rootDir, getMetadataXattr, {
    isRecursive
  });
  return await _fs.promises.writeFile(_path.default.join(rootDir, '.metadata.json'), JSON.stringify(info));
};

exports.default = _default;