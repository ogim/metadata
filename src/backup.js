// @flow

import btoa from 'btoa';
import fileList from './lib/fileList';
import {metadataType} from './lib/metadata.type';
import * as ea from './lib/extendedAttributes';

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

	return data;
};

/**
 *
 * @param dir
 * @param metadataFilePath
 * @param isRecursive
 * @returns {Promise<void>}
 */
export default async (
	rootDir: string,
	metadata: metadataType,
	isRecursive: boolean = false,
) => {
	const metadataNew = await fileList(
		rootDir,
		readMetadataXattr.bind(null, metadata),
		{isRecursive},
	);

	return metadataNew;
};
