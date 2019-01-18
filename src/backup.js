// @flow

import btoa from 'btoa';
import {promises as fs} from 'fs';
import fileList from './lib/fileList';
import {metadataType} from './lib/metadata.type';
import * as ea from './lib/extendedAttributes';
import getWorkingDirectory from './lib/getWorkingDirectory';
import readMetadataJSON from './lib/readMetadataJSON';
import program from "commander";

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const readMetadataXattr = async (
	metadata: metadataType,
	filename: string,
	filenameRelative: string,
): Promise<Object> => {
	const attributes = await ea.getAttributesList(filename);

	// read all attributes
	const data = [];

	for (const attrName of attributes) {
		if (attrName) {
			const test = metadata
				?.find(entry => entry.filename === filenameRelative)
				?.data?.find(entry => entry.name === attrName);

			try {
				const binAttrValue = await ea.getValue(attrName, filename, true),
					asciiAttrValue = await ea.getValue(attrName, filename, false);

				if (!test) {
					console.info(
						`   ADD ${filenameRelative} ${attrName} ${asciiAttrValue}`,
					);
				} else if (btoa(binAttrValue) !== test.btoa) {
					console.info(
						`   CHANGED ${filenameRelative} ${attrName} ${asciiAttrValue}`,
					);
				}

				data.push({
					name: attrName,
					btoa: btoa(binAttrValue),
					ascii: asciiAttrValue,
				});
			} catch (e) {
				console.error(e);
			}
		}
	}

	// we are only interested in the metadata, so if there is no metadata the file is not listed
	if (data.length === 0) {
		return null;
	}

	return {filename: filenameRelative, data};
};

/**
 * Backup extended attributes from directory of files (recursively)
 *
 * @param directory
 * @param options
 */
export default async (
	directory: string,
	options: {recursive: boolean, filename: string},
) => {
	const workingDirectory = await getWorkingDirectory(directory);

	if (workingDirectory) {
		console.time('processtime');

		const {metadataFN, metadata} = await readMetadataJSON(
			workingDirectory,
			options.filename,
		);

		const metadataNew = await fileList(
			workingDirectory,
			readMetadataXattr.bind(null, metadata),
			{isRecursive: options.recursive},
		);

		// compact the array with results and write to disk
		console.info(`write metadata to ${metadataFN}`);
		await fs.writeFile(
			metadataFN,
			JSON.stringify(metadataNew?.filter(obj => obj)),
		);

		console.timeEnd('processtime');
	} else {
		console.error(`directory ${workingDirectory} not found`);
		process.exit(1);
	}
};
