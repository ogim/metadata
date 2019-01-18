// @flow
/* eslint-disable no-restricted-syntax, no-await-in-loop */

import {promises as fs} from 'fs';
import path from 'path';
import backup from "../backup";

/**
 * iterates through directory recurisively to create a list of files
 *
 * @param dir string
 * @param cb Promise
 * @param rootDir string
 * @param paralel
 * @returns {Promise<Array<Promise<all>>>}
 */
const crawl = async (
	dir: string,
	cb: ?Promise,
	options: {isRecursive: ?boolean} = {},
	rootDir: string = dir,
	paralel: ?Array<string> = [],
): Promise<Array<Promise>> => {
	const files = await fs.readdir(dir);

	for (const file of files) {
		const filename = path.join(dir, file);
		const stat = await fs.stat(filename);
		const filenameRelative = filename.substr(rootDir.length + 1);

		if (stat.isDirectory()) {
			if (options.isRecursive === true) {
				paralel = await crawl(filename, cb, options, rootDir, paralel);
			}
		} else if (cb) {
			paralel.push(cb(filename, filenameRelative));
		}
	}

	return paralel;
};

/**
 * crawls the directory and execute the cb promises in paralel
 *
 * @param dir
 * @param cb
 * @param options
 * @returns {Promise<$TupleMap<Array<Promise>, typeof $await>>}
 */
export default async(
	dir: string,
	cb: ?Promise,
	options: {isRecursive: ?boolean} = {},
) => {
	const paralelProcesses = await crawl(dir, cb, options);

	return Promise.all(paralelProcesses);
}
