// @flow

import atob from 'atob';
import btoa from 'btoa';
import fileList from './lib/fileList';
import {metadataType} from './lib/metadata.type';
import * as ea from './lib/extendedAttributes';
import getWorkingDirectory from "./lib/getWorkingDirectory";
import readMetadataJSON from "./lib/readMetadataJSON";

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const setMetadataXattr = async (
	metadata: metadataType,
	filename: string,
	filenameRelative: string,
): Promise<Object> => {
	const attributes = metadata.find(
		entry => entry.filename === filenameRelative,
	);

	if (!attributes) {
		return false;
	}

	// temporarily store the attributes to be written until all attributes have been read and cleared
	const writeAttributesAfterClear = [];

	for (const attr of attributes.data) {
		const {name: attrName, btoa: btoaAttrValue, ascii: attrValueASCII} = attr;

		const btoaAttrValueFile = btoa(
			(await ea.getValue(attrName, filename, true)) || '',
		);

		if (btoaAttrValueFile !== btoaAttrValue) {
			console.info(
				`   write ${filenameRelative} ${attrName} ${attrValueASCII}`,
			);
			writeAttributesAfterClear.push(
				ea.setValue.bind(null, attrName, atob(btoaAttrValue), filename),
			);
		}
	}

	// clear all attributes
	if (attributes.data.length === 0 || writeAttributesAfterClear.length > 0) {
		await ea.clear(filename);
	}

	// write all attributes, dont await the result
	writeAttributesAfterClear.every(call => call());

	return true;
};

/**
 * Restore extended attributes to directory of files (recursively)
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

		const {metadata} = await readMetadataJSON(workingDirectory, options.filename);

		if (metadata != null) {
			await fileList(
				workingDirectory,
				setMetadataXattr.bind(null, metadata),
				{isRecursive: options.recursive},
			);

			console.timeEnd('processtime');
		} else {
			process.exit(1);
		}
	} else {
		console.error(`directory [${workingDirectory}] not found`);
		process.exit(1);
	}


}
