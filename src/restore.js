// @flow

import atob from 'atob';
import btoa from 'btoa';
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
const setMetadataXattr = async (
	metadata: metadataType,
	options: optionsType,
	bar: Function,
	filename: string,
	filenameRelative: string,
): Promise<Object> => {
	bar.increment(1, {file: filenameRelative});

	const attributes = metadata.find(
			entry => entry.filename === filenameRelative,
		),
		data = [];

	// temporarily store the attributes to be written until all attributes have been read and cleared
	const writeAttributesAfterClear = [];

	for (const attr of attributes?.data || []) {
		const {name: attrName, btoa: btoaAttrValue, ascii: asciiAttrValue} = attr;

		if (
			options.alltags !== true &&
			attrName !== 'com.apple.metadata:_kMDItemUserTags'
		) {
			// do nothing
		} else {
			const btoaAttrValueFile = btoa(
				(await ea.getValue(attrName, filename, true)) || '',
			);

			if (btoaAttrValueFile !== btoaAttrValue) {
				data.push({
					name: attrName,
					btoa: btoaAttrValue,
					ascii: asciiAttrValue,
					action: 'CHANGED',
				});
				writeAttributesAfterClear.push(
					ea.setValue.bind(null, attrName, atob(btoaAttrValue), filename),
				);
			}
		}
	}

	// clear all attributes
	if (attributes?.data.length === 0 || writeAttributesAfterClear.length > 0) {
		await ea.clear(filename);
	}

	// write all attributes, dont await the result
	writeAttributesAfterClear.every(call => call());

	return {filename: filenameRelative, data};
};

/**
 * Restore extended attributes to directory of files (recursively)
 *
 * @param directory
 * @param options
 */
export default async (directory: string, options: optionsType) => {
	const workingDirectory = await getWorkingDirectory(directory);

	if (workingDirectory) {
		console.time('processtime');

		const {metadata} = await readMetadataJSON(
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

		if (metadata != null) {
			const report = (await fileList(
				workingDirectory,
				setMetadataXattr.bind(null, metadata, options, bar),
				{isRecursive: options.recursive},
			)).filter(obj => obj);

			bar.stop();

			printReport(report);

			console.timeEnd('processtime');
		} else {
			process.exit(1);
		}
	} else {
		console.error(`directory [${workingDirectory}] not found`);
		process.exit(1);
	}
};
