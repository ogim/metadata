"use strict";

const {
  spawn
} = require('child_process');

const cmdExec = (cmd, attributes) => new Promise((resolve, reject) => {
  const child = spawn(cmd, attributes);
  child.stdout.on('data', data => {
    resolve(data);
  });
  child.on('close', (code, signal) => {
    if (code === 0) {
      resolve(null);
    } else {
      console.log(`child process exited with code ${code} and signal ${signal}`);
    }
  });
  child.stderr.on('data', data => {
    reject(data);
  });
});

module.exports = cmdExec;