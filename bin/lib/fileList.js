#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-restricted-syntax, no-await-in-loop */

/**
 * iterates through directory recurisively to create a list of files
 *
 * @param dir string
 * @param cb function
 * @param rootDir string
 * @param filelist
 * @returns {Promise<Array>}
 */
const crawl = async (dir, cb, options = {}, rootDir = dir, filelist = []) => {
  const files = await _fs.promises.readdir(dir);

  for (const file of files) {
    const filename = _path.default.join(dir, file);

    const stat = await _fs.promises.stat(filename);
    const filenameRelative = filename.substr(rootDir.length + 1);

    if (stat.isDirectory()) {
      filelist.push({
        filename: filenameRelative,
        isDirectory: true
      });

      if (options.isRecursive === true) {
        filelist = await crawl(filename, cb, options, rootDir, filelist);
      }
    } else {
      filelist.push({
        filename: filenameRelative,
        isDirectory: false,
        data: cb && (await cb(filename, filenameRelative))
      });
    }
  }

  return filelist;
};

var _default = crawl;
exports.default = _default;