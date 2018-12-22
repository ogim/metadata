#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _plist = _interopRequireDefault(require("plist"));

var _cmd = _interopRequireDefault(require("./lib/cmd"));

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _btoa = _interopRequireDefault(require("btoa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadata = async filename => {
  const data = await (0, _cmd.default)('mdls', ['-plist', '-', filename]);
  return _plist.default.parse(data.toString());
};

const getMetadataXattr = async filename => {
  const data = [];
  const tags = await (0, _cmd.default)('xattr', [filename]);
  tags && tags.toString().split('\n').forEach(async tag => {
    if (tag) {
      const metaInfo = await (0, _cmd.default)('xattr', ['-px', tag, filename]);
      data.push([tag, (0, _btoa.default)(metaInfo)]);
    }
  });
  return data;
};
/**
 *
 * @param dir
 * @returns {Promise<void>}
 */


var _default = async rootDir => {
  const info = await (0, _fileList.default)(rootDir, getMetadataXattr);
  return await _fs.promises.writeFile(_path.default.join(rootDir, '.metadata.json'), JSON.stringify(info));
};

exports.default = _default;