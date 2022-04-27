'use strict';

const commandExists = require('command-exists').sync;

exports.check = (requiredCommands) => {
  let hasMissingDeps = false;
  for (const command of requiredCommands) {
    if (!commandExists(command.name)) {
      console.error(
        `${command.package} is required (missing global installation)`
      );
      hasMissingDeps = true;
    }
  }
  return hasMissingDeps;
};
