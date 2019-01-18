"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _btoa = _interopRequireDefault(require("btoa"));

var _fs = require("fs");

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _metadata = require("./lib/metadata.type");

var ea = _interopRequireWildcard(require("./lib/extendedAttributes"));

var _getWorkingDirectory = _interopRequireDefault(require("./lib/getWorkingDirectory"));

var _readMetadataJSON = _interopRequireDefault(require("./lib/readMetadataJSON"));

var _commander = _interopRequireDefault(require("commander"));

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const readMetadataXattr = async (metadata, filename, filenameRelative) => {
  const attributes = await ea.getAttributesList(filename); // read all attributes

  const data = [];

  for (const attrName of attributes) {
    if (attrName) {
      var _metadata$find, _metadata$find$data;

      const test = metadata === null || metadata === void 0 ? void 0 : (_metadata$find = metadata.find(entry => entry.filename === filenameRelative)) === null || _metadata$find === void 0 ? void 0 : (_metadata$find$data = _metadata$find.data) === null || _metadata$find$data === void 0 ? void 0 : _metadata$find$data.find(entry => entry.name === attrName);

      try {
        const binAttrValue = await ea.getValue(attrName, filename, true),
              asciiAttrValue = await ea.getValue(attrName, filename, false);

        if (!test) {
          console.info(`   ADD ${filenameRelative} ${attrName} ${asciiAttrValue}`);
        } else if ((0, _btoa.default)(binAttrValue) !== test.btoa) {
          console.info(`   CHANGED ${filenameRelative} ${attrName} ${asciiAttrValue}`);
        }

        data.push({
          name: attrName,
          btoa: (0, _btoa.default)(binAttrValue),
          ascii: asciiAttrValue
        });
      } catch (e) {
        console.error(e);
      }
    }
  } // we are only interested in the metadata, so if there is no metadata the file is not listed


  if (data.length === 0) {
    return null;
  }

  return {
    filename: filenameRelative,
    data
  };
};
/**
 * Backup extended attributes from directory of files (recursively)
 *
 * @param directory
 * @param options
 */


var _default = async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    console.time('processtime');
    const {
      metadataFN,
      metadata
    } = await (0, _readMetadataJSON.default)(workingDirectory, options.filename);
    const metadataNew = await (0, _fileList.default)(workingDirectory, readMetadataXattr.bind(null, metadata), {
      isRecursive: options.recursive
    }); // compact the array with results and write to disk

    console.info(`write metadata to ${metadataFN}`);
    await _fs.promises.writeFile(metadataFN, JSON.stringify(metadataNew === null || metadataNew === void 0 ? void 0 : metadataNew.filter(obj => obj)));
    console.timeEnd('processtime');
  } else {
    console.error(`directory ${workingDirectory} not found`);
    process.exit(1);
  }
};

exports.default = _default;