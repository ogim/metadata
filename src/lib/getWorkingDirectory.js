import program from 'commander';
import {promises as fs} from 'fs';
import os from 'os';

export default async (directory = process.cwd()) => {
	// replace tilde sign with homedir
	if (directory.substring(0, 1) === '~') {
		directory = directory.replace('~', os.homedir());
	}

	// check if the directory is valid
	try {
		const stat = await fs.stat(directory);

		if (!stat.isDirectory()) {
			throw new Error('path is not a directory');
		}
	} catch (e) {
		console.info('invalid directory', directory);
		program.outputHelp();
		process.exit(1);
	}
	program.outputHelp();
	console.log('workingDirectory:', directory);

	return directory;
};
