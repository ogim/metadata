"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _btoa = _interopRequireDefault(require("btoa"));

var _fs = require("fs");

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
const readMetadataXattr = async (metadata, options, bar, filename, filenameRelative) => {
  bar.increment(1, {
    file: filenameRelative
  });
  const attributes = await ea.getAttributesList(filename),
        data = []; // read all attributes

  for (const attrName of attributes) {
    if (options.alltags !== true && attrName !== 'com.apple.metadata:_kMDItemUserTags') {// do nothing
    } else if (attrName) {
      var _metadata$find, _metadata$find$data;

      const test = metadata === null || metadata === void 0 ? void 0 : (_metadata$find = metadata.find(entry => entry.filename === filenameRelative)) === null || _metadata$find === void 0 ? void 0 : (_metadata$find$data = _metadata$find.data) === null || _metadata$find$data === void 0 ? void 0 : _metadata$find$data.find(entry => entry.name === attrName);

      try {
        const binAttrValue = await ea.getValue(attrName, filename, true),
              asciiAttrValue = await ea.getValue(attrName, filename, false);
        let action = null;

        if (!test) {
          action = 'ADD';
        } else if ((0, _btoa.default)(binAttrValue) !== test.btoa) {
          action = 'CHANGED';
        } else {
          action = 'EQUAL';
        }

        data.push({
          name: attrName,
          btoa: (0, _btoa.default)(binAttrValue),
          ascii: asciiAttrValue,
          action
        });
      } catch (e) {
        console.error(e);
      }
    }
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
    const bar = new _cliProgress.default.Bar({
      format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {file}'
    }, _cliProgress.default.Presets.shades_classic);
    bar.start((await (0, _fileList.default)(workingDirectory, null, {
      isRecursive: options.recursive
    })).length, 0, {
      file: ''
    }); // read extended attributes from files in directory and compact the result

    const metadataNew = (await (0, _fileList.default)(workingDirectory, readMetadataXattr.bind(null, metadata, options, bar), {
      isRecursive: options.recursive
    })).filter(obj => obj);
    bar.stop(); // write to disk

    console.info(`write metadata to ${metadataFN}`);
    await _fs.promises.writeFile(metadataFN, JSON.stringify(metadataNew));
    (0, _printReport.default)(metadataNew);
    console.timeEnd('processtime');
  } else {
    console.error(`directory ${workingDirectory} not found`);
    process.exit(1);
  }
};

exports.default = _default;