// @flow

import program from 'commander';
import {promises as fs} from 'fs';
import backup from './backup';
import restore from './restore';
import getWorkingDirectory from './lib/getWorkingDirectory';
import getMetadata from './lib/getMetadata';

import {version} from './../package';

program
	.version(version, '-v, --version')
	.name('metadata')
	.description('Backup and restore metadata to files')
	.usage('[commands] [options] directory')
;

program
	.command('restore [directory]')
	.description('Updates files with previously stored metadata from [filename]')
	.option(
		'-r, --recursive',
		'recursive'
	)
	.option(
		'-f, --filename <fileName>',
		'optionally supply the filename where the metadata is stored. Default ".metadata"',
	)
	.action(async (directory, options) => {
		const workingDirectory = await getWorkingDirectory(directory);

		if (workingDirectory) {
			const {metadata} = await getMetadata(workingDirectory, options.filename);

			if (metadata != null) {
				await restore(workingDirectory, metadata, options.recursive);
			} else {
				process.exit(1);
			}
		} else {
			console.error(`directory [${workingDirectory}] not found`);
			process.exit(1);
		}
	});

program
	.command('backup [directory]')
	.description('Reads metadata of files and store this in a file [filename]')
	.option(
		'-r, --recursive',
		'recursive'
	)
	.option(
		'-f, --filename <fileName>',
		'optionally supply the filename where the metadata is stored. Default ".metadata"',
	)
	.action(async (directory, options) => {
		const workingDirectory = await getWorkingDirectory(directory);

		if (workingDirectory) {
			const {metadataFN, metadata} = await getMetadata(
				workingDirectory,
				options.filename,
			);

			const metadataNew = await backup(
				workingDirectory,
				metadata,
				options.recursive,
			);

			console.info(`write metadata to ${metadataFN}`);
			await fs.writeFile(metadataFN, JSON.stringify(metadataNew));
		}
		else{
			console.error(`directory ${workingDirectory} not found`);
			process.exit(1);
		}
	});

program.command('help').action(env => {
 	program.outputHelp();
});

program.parse(process.argv);
