'use strict';

require('dotenv').config();

const filterEmptyOptions = (options) =>
  Object.entries(options).reduce((obj, [key, value]) => {
    if (String(value)) {
      obj[key] = value;
    }
    return obj;
  }, {});

const checkOptions = (env, options) => {
  let isValid = true;
  for (const [name, params] of Object.entries(options)) {
    if (!(name in env) || !String(env[name])) {
      if (params.default) {
        env[name] = params.default;
      } else {
        console.warn(
          `Option "${name}" is not specified into config.json or .env!`
        );
        isValid = false;
      }
    }
  }
  return isValid;
};

module.exports = () => {
  // check configuration
  let config;
  try {
    // eslint-disable-next-line global-require
    config = require('../config.json');
  } catch {
    console.error(
      'config.json is missing or corrupted, use config.example.json as template'
    );
    process.exit(1);
  }

  // populate values from config.json to process enviroment (higher priority)
  Object.assign(process.env, filterEmptyOptions(config));

  const isConfigValid = checkOptions(process.env, {
    AWS_ACCESS_KEY_ID: {},
    AWS_SECRET_ACCESS_KEY: {},
    bucket: {},
    region: { default: 'eu-west-3' },
    videoKey: {},
    previewKey: {},
    previewIntervalMs: { default: 5000 },
  });
  if (isConfigValid === false) {
    console.error('Please fix configuration and try again');
    process.exit(1);
  }
};
