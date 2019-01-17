"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

const defaultFileName = '.metadata.json';

var _default = async (directory, filename) => {
  const metadataFN = _path.default.join(directory, filename || defaultFileName);

  try {
    const stat = await _fs.promises.stat(metadataFN);

    if (stat.isFile()) {
      try {
        const metadataFile = await _fs.promises.readFile(metadataFN),
              metadata = JSON.parse(metadataFile.toString());
        console.info(`read metadata from ${metadataFN}`);
        return {
          metadataFN,
          metadata
        };
      } catch (e) {
        console.error(`READERROR can not read file ${metadataFN}`);
        return null;
      }
    } else {
      console.info(`file ${metadataFN} is not a file`);
      return {
        metadataFN,
        metadata: []
      };
    }
  } catch (e) {
    console.info(`file ${metadataFN} does not exist`);
    return {
      metadataFN,
      metadata: []
    };
  }
};

exports.default = _default;