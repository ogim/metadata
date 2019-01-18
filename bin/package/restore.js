"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atob = _interopRequireDefault(require("atob"));

var _btoa = _interopRequireDefault(require("btoa"));

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _metadata = require("./lib/metadata.type");

var ea = _interopRequireWildcard(require("./lib/extendedAttributes"));

var _getWorkingDirectory = _interopRequireDefault(require("./lib/getWorkingDirectory"));

var _readMetadataJSON = _interopRequireDefault(require("./lib/readMetadataJSON"));

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const setMetadataXattr = async (metadata, filename, filenameRelative) => {
  const attributes = metadata.find(entry => entry.filename === filenameRelative);

  if (!attributes) {
    return false;
  } // temporarily store the attributes to be written until all attributes have been read and cleared


  const writeAttributesAfterClear = [];

  for (const attr of attributes.data) {
    const {
      name: attrName,
      btoa: btoaAttrValue,
      ascii: attrValueASCII
    } = attr;
    const btoaAttrValueFile = (0, _btoa.default)((await ea.getValue(attrName, filename, true)) || '');

    if (btoaAttrValueFile !== btoaAttrValue) {
      console.info(`   write ${filenameRelative} ${attrName} ${attrValueASCII}`);
      writeAttributesAfterClear.push(ea.setValue.bind(null, attrName, (0, _atob.default)(btoaAttrValue), filename));
    }
  } // clear all attributes


  if (attributes.data.length === 0 || writeAttributesAfterClear.length > 0) {
    await ea.clear(filename);
  } // write all attributes, dont await the result


  writeAttributesAfterClear.every(call => call());
  return true;
};
/**
 * Restore extended attributes to directory of files (recursively)
 *
 * @param directory
 * @param options
 */


var _default = async (directory, options) => {
  const workingDirectory = await (0, _getWorkingDirectory.default)(directory);

  if (workingDirectory) {
    console.time('processtime');
    const {
      metadata
    } = await (0, _readMetadataJSON.default)(workingDirectory, options.filename);

    if (metadata != null) {
      await (0, _fileList.default)(workingDirectory, setMetadataXattr.bind(null, metadata), {
        isRecursive: options.recursive
      });
      console.timeEnd('processtime');
    } else {
      process.exit(1);
    }
  } else {
    console.error(`directory [${workingDirectory}] not found`);
    process.exit(1);
  }
};

exports.default = _default;