// @flow
/* eslint-disable no-restricted-syntax, no-await-in-loop */

import {promises as fs} from 'fs';
import path from 'path';

/**
 * iterates through directory recurisively to create a list of files
 *
 * @param dir
 * @param cb
 * @param rootDir
 * @param filelist
 * @returns {Promise<Array>}
 */
const crawl = async (
	dir: string,
	cb: ?Function,
	rootDir: string = dir,
	filelist: ?Array<string> = [],
): Promise<Array> => {
	const files = await fs.readdir(dir);

	for (const file of files) {
		const filename = path.join(dir, file);
		const stat = await fs.stat(filename);
		const filenameRelative = filename.substr(rootDir.length + 1);

		if (stat.isDirectory()) {
			filelist.push({filename: filenameRelative, isDirectory: true});
			filelist = await crawl(filename, cb, rootDir, filelist);
		} else {
			filelist.push({
				filename: filenameRelative,
				isDirectory: false,
				data: cb && (await cb(filename)),
			});
		}
	}

	return filelist;
};

export default crawl;
