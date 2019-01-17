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
 *
 * @param dir
 * @param metadataFilePath
 * @param isRecursive
 * @returns {Promise<void>}
 */


var _default = async (rootDir, metadata, isRecursive = false) => {
  try {
    const info = await (0, _fileList.default)(rootDir, setMetadataXattr.bind(null, metadata), {
      isRecursive
    });
  } catch (e) {
    console.error('unknown error', e);
    process.exit(1);
  }
};

exports.default = _default;