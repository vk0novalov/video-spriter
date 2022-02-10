'use strict';

const commandExists = require('command-exists').sync;

// check system dependencies
const requiredCommands = [
  { name: 'ffmpeg', package: 'ffmpeg' },
  { name: 'convert', package: 'imagemagick' },
];

module.exports = () => {
  let hasMissingDeps = false;
  for (const command of requiredCommands) {
    if (!commandExists(command.name)) {
      console.error(
        `${command.package} is required (missing global installation)`
      );
      hasMissingDeps = true;
    }
  }
  if (hasMissingDeps) {
    process.exit(1);
  }
};
