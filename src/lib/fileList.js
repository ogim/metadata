// @flow
/* eslint-disable no-restricted-syntax, no-await-in-loop */

import {promises as fs} from 'fs';
import path from 'path';

/**
 * iterates through directory recurisively to create a list of files
 *
 * @param dir string
 * @param cb Promise
 * @param rootDir string
 * @param process
 * @returns {Promise<Array<Promise<all>>>}
 */
const crawl = async (
	dir: string,
	cb: ?Promise,
	options: {isRecursive: ?boolean} = {},
	rootDir: string = dir,
	process: ?Array<string> = [],
): Promise<Array<Promise<all>>> => {
	const files = await fs.readdir(dir);

	for (const file of files) {
		const filename = path.join(dir, file);
		const stat = await fs.stat(filename);
		const filenameRelative = filename.substr(rootDir.length + 1);

		if (stat.isDirectory()) {
			if (options.isRecursive === true) {
				process = await crawl(filename, cb, options, rootDir, process);
			}
		} else if (cb) {
			process.push(cb(filename, filenameRelative));
		}
		else{
			process.push({filename, filenameRelative});
		}
	}

	return process;
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
): Promise<Array<all>> => {
	const paralelProcesses = await crawl(dir, cb, options);

	return Promise.all(paralelProcesses);
}
