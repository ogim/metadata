// @flow

import {promises as fs} from 'fs';
import path from 'path';

const defaultFileName = '.metadata.json';

/**
 * returns earlier stored metadata from json file
 *
 * @param directory
 * @param filename
 * @returns {Promise<*>}
 */
export default async (directory: string, filename: string) => {
	const metadataFN = path.join(directory, filename || defaultFileName);

	try {
		const stat = await fs.stat(metadataFN);

		if (stat.isFile()) {
			try {
				const metadataFile = await fs.readFile(metadataFN),
					metadata = JSON.parse(metadataFile.toString());

				console.info(`read metadata from ${metadataFN}`);

				return {metadataFN, metadata};
			} catch (e) {
				console.error(`READERROR can not read file ${metadataFN}`);

				return null;
			}
		} else {
			console.info(`file ${metadataFN} is not a file`);

			return {metadataFN, metadata: []};
		}
	} catch (e) {
		console.info(`file ${metadataFN} does not exist`);

		return {metadataFN, metadata: []};
	}
};
