// @flow

import btoa from 'btoa';
import {promises as fs} from 'fs';
import Progress from 'cli-progress';
import fileList from './lib/fileList';
import {metadataType} from './lib/metadata.type';
import {optionsType} from './lib/options.type';
import * as ea from './lib/extendedAttributes';
import getWorkingDirectory from './lib/getWorkingDirectory';
import readMetadataJSON from './lib/readMetadataJSON';
import printReport from './printReport';

/**
 * retrieves all metadata for a file and parse it as json
 *
 * @param filename
 * @returns {Promise<*>}
 */
const readMetadataXattr = async (
	metadata: metadataType,
	options: optionsType,
	bar: Function,
	filename: string,
	filenameRelative: string,
): Promise<Object> => {
	bar.increment(1, {file: filenameRelative});

	// console.log('==>', filename);

	const attributes = await ea.getAttributesList(filename),
		data = [];

	// read all attributes
	for (const attrName of attributes) {
		if (
			options.alltags !== true &&
			attrName !== 'com.apple.metadata:_kMDItemUserTags'
		) {
			// do nothing
		} else if (attrName) {
			const test = metadata
				?.find(entry => entry.filename === filenameRelative)
				?.data?.find(entry => entry.name === attrName);

			try {
				const binAttrValue = await ea.getValue(attrName, filename, true),
					asciiAttrValue = await ea.getValue(attrName, filename, false);

				let action = null;

				if (!test) {
					action = 'ADD';
				} else if (btoa(binAttrValue) !== test.btoa) {
					action = 'CHANGED';
				} else {
					action = 'EQUAL';
				}

				data.push({
					name: attrName,
					btoa: btoa(binAttrValue),
					ascii: asciiAttrValue,
					action,
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
export default async (directory: string, options: optionsType) => {
	const workingDirectory = await getWorkingDirectory(directory);

	if (workingDirectory) {
		console.time('processtime');

		const {metadataFN, metadata} = await readMetadataJSON(
			workingDirectory,
			options.filename,
		);

		const bar = new Progress.Bar(
			{
				format:
					'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {file}',
			},
			Progress.Presets.shades_classic,
		);

		bar.start(
			(await fileList(workingDirectory, null, {isRecursive: options.recursive}))
				.length,
			0,
			{
				file: '',
			},
		);

		// read extended attributes from files in directory and compact the result
		const metadataNew = (await fileList(
			workingDirectory,
			readMetadataXattr.bind(null, metadata, options, bar),
			{isRecursive: options.recursive},
		)).filter(obj => obj);

		bar.stop();

		// write to disk
		console.info(`write metadata to ${metadataFN}`);
		await fs.writeFile(metadataFN, JSON.stringify(metadataNew));

		printReport(metadataNew);

		console.timeEnd('processtime');
	} else {
		console.error(`directory ${workingDirectory} not found`);
		process.exit(1);
	}
};
