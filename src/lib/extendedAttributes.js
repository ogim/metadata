// @flow
// use strict;

import cmd from './cmd';

/**
 * returns a list of attributes of a file
 *
 * @param filename
 * @returns {Promise<Array<string>|Array>}
 */
export const getAttributesList = async (
	filename: string,
): Promise<Array<string>> => {
	const ATTRIBUTES = await cmd('xattr', [filename]);

	const attributes = ATTRIBUTES && ATTRIBUTES.toString().split('\n');

	return attributes || [];
};

/**
 * clear all attributes
 *
 * @param filename
 * @returns {Promise<boolean>}
 */
export const clear = async (filename: string): Promise<string> => {
	return cmd('xattr', ['-c', filename]);
};

/**
 *
 * @param attribute
 * @param filename
 * @param isBin
 * @returns {Promise<*>}
 */
export const getValue = async (
	attribute: string,
	filename: string,
	isBin: boolean = false,
): Promise<Array<string>> => {
	try{
		if (isBin) {
			const valueBin = await cmd('xattr', ['-px', attribute, filename]);

			return valueBin;
		}

		const ASCIIVALUE = await cmd('mdls', [
			'-name',
			attribute.split(':_')[1],
			filename,
		]);

		const values = ASCIIVALUE.toString()
			.replace(/[ ,"]/g, '')
			.split('\n')
			.slice(1, -2);

		if (values.length > 0) {
			return values;
		}

		return [ASCIIVALUE.toString()];
	}
	catch(e){
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
export const setValue = async (
	attribute: string,
	value: string,
	filename: string,
): Promise<Array<boolean>> => {
	return cmd('xattr', ['-wx', attribute, value, filename]);
};
