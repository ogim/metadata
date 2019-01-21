import program from 'commander';
import {promises as fs} from 'fs';
import os from 'os';
import path from 'path';

export default async (directory = process.cwd()) => {
	// replace tilde sign with homedir
	if (directory.substring(0, 1) === '~') {
		directory = directory.replace('~', os.homedir());
	} else if (directory.substring(0, 1) === '.') {
		directory = path.join(process.cwd(), directory);
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
	// uniform dir to end on /
	directory = path.join(directory, '/');

	return directory;
};
