// @flow

const {spawn} = require('child_process');

const cmdExec = (cmd: string, attributes: Array<string>) =>
	new Promise((resolve, reject) => {
		const child = spawn(cmd, attributes);

		child.stdout.on('data', data => {
			resolve(data);
		});

		child.on('close', (code, signal) => {
			if (code === 0) {
				resolve(null);
			} else {
				console.error(
					`cmd ${cmd} ${attributes} process exited with code ${code} and signal ${signal}`,
				);
			}
		});

		child.stderr.on('data', data => {
			console.error(`Error ${cmd} ${attributes} ${data.toString()}`);
			reject(data);
		});
	});

module.exports = cmdExec;
