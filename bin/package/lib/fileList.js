"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

/* eslint-disable no-restricted-syntax, no-await-in-loop */

/**
 * iterates through directory recurisively to create a list of files
 *
 * @param dir string
 * @param cb Promise
 * @param rootDir string
 * @param process
 * @returns {Promise<Array<Promise<all>>>}
 */
const crawl = async (dir, cb, options = {}, rootDir = dir, process = []) => {
  const files = await _fs.promises.readdir(dir);

  for (const file of files) {
    const filename = _path.default.join(dir, file);

    const stat = await _fs.promises.stat(filename);
    const filenameRelative = filename.substr(rootDir.length);

    if (stat.isDirectory()) {
      if (options.isRecursive === true) {
        process = await crawl(filename, cb, options, rootDir, process);
      }
    } else if (cb) {
      process.push(cb(filename, filenameRelative));
    } else {
      process.push({
        filename,
        filenameRelative
      });
    }
  }

  return process;
};
/**
 * crawls the directory and execute the cb promises in paralel
 *
 * @param dir
 * @param cb
 * @param options
 * @returns {Promise<$TupleMap<Array<Promise>, typeof $await>>}
 */


var _default = async (dir, cb, options = {}) => {
  const paralelProcesses = await crawl(dir, cb, options);
  return Promise.all(paralelProcesses);
};

exports.default = _default;