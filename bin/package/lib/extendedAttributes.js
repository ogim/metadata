"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setValue = exports.getValue = exports.clear = exports.getAttributesList = void 0;

var _cmd = _interopRequireDefault(require("./cmd"));

// use strict;

/**
 * returns a list of attributes of a file
 *
 * @param filename
 * @returns {Promise<Array<string>|Array>}
 */
const getAttributesList = async filename => {
  const ATTRIBUTES = await (0, _cmd.default)('xattr', [filename]);
  const attributes = ATTRIBUTES && ATTRIBUTES.toString().split('\n');
  return attributes || [];
};
/**
 * clear all attributes
 *
 * @param filename
 * @returns {Promise<boolean>}
 */


exports.getAttributesList = getAttributesList;

const clear = async filename => {
  return (0, _cmd.default)('xattr', ['-c', filename]);
};
/**
 *
 * @param attribute
 * @param filename
 * @param isBin
 * @returns {Promise<*>}
 */


exports.clear = clear;

const getValue = async (attribute, filename, isBin = false) => {
  try {
    if (isBin) {
      const valueBin = await (0, _cmd.default)('xattr', ['-px', attribute, filename]);
      return valueBin;
    }

    const ASCIIVALUE = await (0, _cmd.default)('mdls', ['-name', attribute.split(':_')[1], filename]);
    const values = ASCIIVALUE.toString().replace(/[ ,"]/g, '').split('\n').slice(1, -2);

    if (values.length > 0) {
      return values;
    }

    return [ASCIIVALUE.toString()];
  } catch (e) {
    return null;
  }
};
/**
 * set an extended attribute value
 *
 * @param attribute
 * @param value
 * @param filename
 * @returns {Promise<boolean>}
 */


exports.getValue = getValue;

const setValue = async (attribute, value, filename) => {
  return (0, _cmd.default)('xattr', ['-wx', attribute, value, filename]);
};

exports.setValue = setValue;