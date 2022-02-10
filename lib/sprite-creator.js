'use strict';

const { spawn } = require('child_process');
const { EventEmitter } = require('stream');

const { callOnce } = require('./utils');

const generateFFMpegParams = (intervalMs) => [
  '-i',
  '-',
  '-vf',
  `fps=1/${Math.round(intervalMs / 1000)}`,
  '-f',
  'image2pipe',
  '-vcodec',
  'ppm',
  'pipe:1',
];

const generateConvertParams = () => ['-', '', '-append', '', 'jpeg:-'];

class SpriteCreator extends EventEmitter {
  constructor() {
    super();

    this.frame = 0;
  }

  handleProgress(output) {
    const matches = output.match(/frame=\W+([\d]+)/);
    if (matches && matches.length > 1) {
      const frame = Number(matches[1]);
      if (frame !== this.frame) {
        this.emit('frame', frame);
        this.frame = frame;
      }
    }
  }

  process(videoStream, imageStream, intervalMs) {
    return new Promise((resolve, reject) => {
      const rejectOnce = callOnce(reject);

      const childFFMpeg = spawn('ffmpeg', generateFFMpegParams(intervalMs), {
        windowsHide: true,
      });
      videoStream.pipe(childFFMpeg.stdin);
      childFFMpeg.stderr.on('data', (data) =>
        this.handleProgress(data.toString())
      );
      childFFMpeg.on('error', rejectOnce);
      childFFMpeg.on('exit', () => console.log('Generate final sprite...'));

      const childConvert = spawn('convert', generateConvertParams(), {
        windowsHide: true,
        stdio: [childFFMpeg.stdout, 'pipe', 'pipe'],
      });
      childConvert.stdout.pipe(imageStream);
      childConvert.on('error', rejectOnce);
      childConvert.on('exit', () =>
        console.log('Uploading sprite to storage...')
      );

      imageStream.on('end', resolve);
    });
  }
}

module.exports = {
  SpriteCreator,
};
