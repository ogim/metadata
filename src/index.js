#!/usr/bin/env ./node_modules/.bin/babel-node
// @flow

import program from 'commander';
import backup from './backup';
import getWorkingDirectory from './lib/getWorkingDirectory';

program.version('0.1.0');

program
	.command('restore [directory]')
	.description('restore metadata to files')
	.option('-r, --recursive', 'recursive')
	.action((directory, options) => {
		console.log('restore', directory, options);
	});

program
	.command('backup [directory]')
	.description('backup metadata')
	.option('-r, --recursive', 'recursive')
	.action(async (directory, options) => {
		const workingDirectory = await getWorkingDirectory(directory);

		if (workingDirectory) {
			await backup(workingDirectory, options.recursive);
		} else {
			process.exit(1);
		}
	});

program.command('*').action(env => {
	program.outputHelp();
	process.exit(1);
});

program.parse(process.argv);
