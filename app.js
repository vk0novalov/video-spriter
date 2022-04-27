'use strict';

const { check: checkRequirements } = require('./lib/requirements');

// check system dependencies
const requiredCommands = [
  { name: 'ffmpeg', package: 'ffmpeg' },
  { name: 'convert', package: 'imagemagick' },
];
if (checkRequirements(requiredCommands) === false) {
  process.exit(1);
}

require('./lib/config')();

const videoStorage = require('./lib/video-storage');

const { SpriteCreator } = require('./lib/sprite-creator');

async function createSpriteFromVideo(videoKey, previewKey, previewIntervalMs) {
  console.log('Preparing to generate thumbnails with sprite from video');
  const spriteCreator = new SpriteCreator(previewIntervalMs);
  spriteCreator.on('frame', (frame) =>
    console.log(`Frame #${frame} was successfully created`)
  );

  const downloadStream = videoStorage.getDownloadStream(videoKey);
  downloadStream.on('error', (err) => console.error(err));
  const uploadStream = videoStorage.getUploadStream(previewKey, (err) => {
    console.log(err ? console.error('❌ Error', err) : '✅ Done');
  });
  await spriteCreator.process(downloadStream, uploadStream);
}

createSpriteFromVideo(
  process.env.videoKey,
  process.env.previewKey,
  process.env.previewIntervalMs
).catch(console.error);
