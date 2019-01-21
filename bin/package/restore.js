"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atob = _interopRequireDefault(require("atob"));

var _btoa = _interopRequireDefault(require("btoa"));

var _cliProgress = _interopRequireDefault(require("cli-progress"));

var _fileList = _interopRequireDefault(require("./lib/fileList"));

var _metadata = require("./lib/metadata.type");

var _options = require("./lib/options.type");

var ea = _interopRequireWildcard(require("./lib/extendedAttributes"));

var _getWorkingDirectory = _interopRequireDefault(require("./lib/getWorkingDirectory"));

var _readMetadataJSON = _interopRequireDefault(require("./lib/readMetadataJSON"));

var _printReport = _interopRequireDefault(require("./printReport"));

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const setMetadataXattr = async (metadata, options, bar, filename, filenameRelative) => {
  bar.increment(1, {
    file: filenameRelative
  });
  const attributes = metadata.find(entry => entry.filename === filenameRelative),
        data = []; // temporarily store the attributes to be written until all attributes have been read and cleared

  const writeAttributesAfterClear = [];

  for (const attr of (attributes === null || attributes === void 0 ? void 0 : attributes.data) || []) {
    const {
      name: attrName,
      btoa: btoaAttrValue,
      ascii: asciiAttrValue
    } = attr;

    if (options.alltags !== true && attrName !== 'com.apple.metadata:_kMDItemUserTags') {// do nothing
    } else {
      const btoaAttrValueFile = (0, _btoa.default)((await ea.getValue(attrName, filename, true)) || '');

      if (btoaAttrValueFile !== btoaAttrValue) {
        data.push({
          name: attrName,
          btoa: btoaAttrValue,
          ascii: asciiAttrValue,
          action: 'CHANGED'
        });
        writeAttributesAfterClear.push(ea.setValue.bind(null, attrName, (0, _atob.default)(btoaAttrValue), filename));
      }
    }
  } // clear all attributes


  if ((attributes === null || attributes === void 0 ? void 0 : attributes.data.length) === 0 || writeAttributesAfterClear.length > 0) {
    await ea.clear(filename);
  } // write all attributes, dont await the result


  writeAttributesAfterClear.every(call => call());
  return {
    filename: filenameRelative,
    data
  };
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
    const bar = new _cliProgress.default.Bar({
      format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {file}'
    }, _cliProgress.default.Presets.shades_classic);
    bar.start((await (0, _fileList.default)(workingDirectory, null, {
      isRecursive: options.recursive
    })).length, 0, {
      file: ''
    });

    if (metadata != null) {
      const report = (await (0, _fileList.default)(workingDirectory, setMetadataXattr.bind(null, metadata, options, bar), {
        isRecursive: options.recursive
      })).filter(obj => obj);
      bar.stop();
      (0, _printReport.default)(report);
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