// @flow

import plist from 'plist';
import cmd from './lib/cmd';
import fileList from './lib/fileList';
import {promises as fs} from 'fs';
import path from 'path';
import btoa from 'btoa';

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const getMetadata = async (filename: string): Promise<Object>=>{
	const data = await cmd('mdls', [
	 	'-plist',
	 	'-',
	 	filename,
	]);
	return plist.parse(data.toString());
}

const getMetadataXattr = async (filename: string): Promise<Object>=>{
	const data = [];

	const tags = await cmd('xattr', [
		filename
	]);

	tags && tags.toString().split('\n').forEach(async tag=>{
		if (tag){
			const metaInfo = await cmd('xattr',[
				'-px',
				tag,
				filename
			]);
			data.push([tag, btoa(metaInfo)]);
		}
	});

	return data;
};

/**
 *
 * @param dir
 * @returns {Promise<void>}
 */
export default async (rootDir: string) => {
	const info = await fileList(rootDir, getMetadataXattr);

	return await fs.writeFile(path.join(rootDir,'.metadata.json'), JSON.stringify(info));
};
