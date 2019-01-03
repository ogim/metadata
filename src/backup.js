// @flow

import plist from 'plist';
import {promises as fs} from 'fs';
import path from 'path';
import btoa from 'btoa';
import fileList from './lib/fileList';
import cmd from './lib/cmd';

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadataXattr = async (filename: string, filenameRelative: string): Promise<Object> => {
	console.info('  ', filenameRelative);
	const ATTRIBUTES = await cmd('xattr', [filename]);

	const attributes = ATTRIBUTES &&
		ATTRIBUTES
			.toString()
			.split('\n')
	;

	if (! attributes){
		return [];
	}

	// read all attributes
	const data = [];
	for (const attrName of attributes){
		if (attrName) {
			try{
				const attrValue = await cmd('xattr', ['-px', attrName, filename]);
				console.info('   **', attrName);
				data.push([attrName, btoa(attrValue)]);
			}
			catch(e){
				console.error(e);
			}

		}
	}

	return data;
};

/**
 *
 * @param dir
 * @param filename
 * @param isRecursive
 * @returns {Promise<void>}
 */
export default async (rootDir: string, filename: string, isRecursive: boolean = false) => {
	const info = await fileList(rootDir, getMetadataXattr, {isRecursive});

	return await fs.writeFile(
		path.join(rootDir, '.metadata.json'),
		JSON.stringify(info),
	);
};
