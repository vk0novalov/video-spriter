'use strict';

const { spawn } = require('child_process');
const { EventEmitter } = require('stream');

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
  #intervalMs;

  #frame;

  constructor(intervalMs) {
    super();

    this.#intervalMs = intervalMs;
    this.#frame = 0;
  }

  get intervalMs() {
    return this.#intervalMs;
  }

  handleProgress(output) {
    const [, frameMatch] = output.match(/frame=\W+([\d]+)/);
    if (frameMatch) {
      const frame = Number(frameMatch);
      if (frame !== this.#frame) {
        this.emit('frame', frame);
        this.#frame = frame;
      }
    }
  }

  static #spawnFFMpeg(intervalMs, onProgress, onReject) {
    const childFFMpeg = spawn('ffmpeg', generateFFMpegParams(intervalMs), {
      windowsHide: true,
    });
    childFFMpeg.stderr.on('data', (data) => onProgress?.(data.toString()));
    childFFMpeg.on('error', onReject);
    childFFMpeg.on('exit', () => console.log('Generate final sprite...'));
  }

  static #spawnConvert(stdin, onReject) {
    const childConvert = spawn('convert', generateConvertParams(), {
      windowsHide: true,
      stdio: [stdin, 'pipe', 'pipe'],
    });
    childConvert.on('error', onReject);
    childConvert.on('exit', () =>
      console.log('Uploading sprite to storage...')
    );
  }

  process(videoStream, imageStream) {
    return new Promise((resolve, reject) => {
      const childFFMpeg = SpriteCreator.#spawnFFMpeg(
        this.#intervalMs,
        this.handleProgress,
        reject
      );
      const childConvert = SpriteCreator.#spawnConvert(
        childFFMpeg.stdout,
        reject
      );

      videoStream.pipe(childFFMpeg.stdin);
      childConvert.stdout.pipe(imageStream);

      imageStream.on('end', resolve);
    });
  }
}

module.exports = {
  SpriteCreator,
};
