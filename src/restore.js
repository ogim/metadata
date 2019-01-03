// @flow

import plist from 'plist';
import {promises as fs} from 'fs';
import path from 'path';
import atob from 'atob';
import fileList from './lib/fileList';
import cmd from './lib/cmd';

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadataXattr = async (metadata:object, filename: string, filenameRelative: string): Promise<Object> => {

	//const tags = await cmd('xattr', [filename]);
	console.info('  ',filenameRelative);

	const attributes = metadata.find(entry=>{
		return entry.filename === filenameRelative
	});

	if (!attributes){return false;}

	// clear all attributes
	await cmd('xattr', ['-c', filename]);

	// set attributes
	for (const attr of attributes.data){
		const [attrName, attrValue] = attr;
		console.info('   **', attrName);
		await cmd('xattr', ['-wx', attrName, atob(attrValue), filename]);
	}

	return true;
};

/**
 *
 * @param dir
 * @param filename
 * @param isRecursive
 * @returns {Promise<void>}
 */
export default async (rootDir: string, filename: string, isRecursive: boolean = false) => {
	const metadata = await fs.readFile(path.join(rootDir, filename));

	try{
		const metadataJSON=JSON.parse(metadata.toString());

		const info = await fileList(rootDir, getMetadataXattr.bind(null,metadataJSON), {isRecursive});
	}
	catch(e){
		console.error('invalid metadata',e);
		process.exit(1);
	}

};
