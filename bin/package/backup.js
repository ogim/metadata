"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _metadata = require("./lib/metadata.type");

var ea = _interopRequireWildcard(require("./lib/extendedAttributes"));

var _btoa = _interopRequireDefault(require("btoa"));

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
      const test = metadata.find(entry => entry.filename === filenameRelative).data.find(entry => entry.name === attrName);

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
  }

  return data;
};
/**
 *
 * @param dir
 * @param metadataFilePath
 * @param isRecursive
 * @returns {Promise<void>}
 */


var _default = async (rootDir, metadata, isRecursive = false) => {
  const metadataNew = await (0, _fileList.default)(rootDir, readMetadataXattr.bind(null, metadata), {
    isRecursive
  });
  return metadataNew;
};

exports.default = _default;