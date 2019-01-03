#!/usr/bin/env ./node_modules/.bin/babel-node
// @flow

import program from 'commander';
import backup from './backup';
import restore from './restore';
import getWorkingDirectory from './lib/getWorkingDirectory';
import {promises as fs} from "fs";
import path from "path";

const defaultFileName = '.metadata.json';

program
	.version('0.1.0', '-v, --version')
;

program
	.command('restore [directory]')
	.description('restore metadata to files')
	.option('-r, --recursive', 'recursive')
	.option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored')
	.action(async (directory, options) => {
		const workingDirectory = await getWorkingDirectory(directory);

		if (workingDirectory) {
			const filename = options.fileName || defaultFileName;
			try {
				const stat = await fs.stat(path.join(workingDirectory, filename));
				if (stat.isFile()) {
					await restore(workingDirectory, filename, options.recursive);
				} else {
					console.error(`${filename} is not a file`);
					process.exit(1);
				}
			}
			catch(e){
				console.error(`${filename} not found`);
				process.exit(1);
			}
		} else {
			process.exit(1);
		}

	});

program
	.command('backup [directory]')
	.description('backup metadata')
	.option('-r, --recursive', 'recursive')
	.option('-f, --filename <fileName>', 'optionally supply the filename where the metadata is stored')
	.action(async (directory, options) => {
		const workingDirectory = await getWorkingDirectory(directory);

		if (workingDirectory) {
			const filename = options.fileName || defaultFileName;
			await backup(workingDirectory, filename, options.recursive);
		} else {
			process.exit(1);
		}
	});

program.command('*').action(env => {
	program.outputHelp();
	process.exit(1);
});

program.parse(process.argv);
