// @flow

import program from 'commander';
import backup from './backup';
import restore from './restore';
import {version} from '../package';

program
	.version(version, '-v, --version')
	.name('metadata')
	.description('Backup and restore metadata to files')
	.usage('[commands] [options] directory');

program
	.command('restore [directory]')
	.description('Updates files with previously stored metadata from [filename]')
	.option('-r, --recursive', 'recursive')
	.option(
		'-f, --filename <fileName>',
		'optionally supply the filename where the metadata is stored. Default ".metadata"',
	)
	.action(restore);

program
	.command('backup [directory]')
	.description('Reads metadata of files and store this in a file [filename]')
	.option('-r, --recursive', 'recursive')
	.option(
		'-f, --filename <fileName>',
		'optionally supply the filename where the metadata is stored. Default ".metadata"',
	)
	.action(backup);

program.command('help').action(env => {
	program.outputHelp();
});

program.parse(process.argv);
