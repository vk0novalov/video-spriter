# Video Spriter

Application downloads video file from Amazon S3, performs processing, and uploads image sprite back to Amazon S3.

## Requirements

* ffmpeg
* imagemagick

## Install deps and run

```
$ npm i --production
$ npm start
```

## Configuration

It based on config.json (use config.example.json as template) and global env (supports .env into a root).

### Example:

```
{
  "AWS_ACCESS_KEY_ID" : "KEY_ID",
  "AWS_SECRET_ACCESS_KEY": "ACCESS_KEY",
  "bucket": "bucket_name",
  "region": "eu-west-3",
  "videoKey": "video.ts",
  "previewKey": "preview_name.jpg",
  "previewIntervalMs": "5000"
}
```