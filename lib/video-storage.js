'use strict';

const AWS = require('aws-sdk');
const { PassThrough } = require('stream');

AWS.config.update({ region: process.env.region });

const s3 = new AWS.S3();

const getDownloadStream = (keyName) => {
  const params = {
    Bucket: process.env.bucket,
    Key: keyName,
  };
  return s3.getObject(params).createReadStream();
};

const getUploadStream = (keyName, onDone) => {
  const passStream = new PassThrough();

  const uploadParams = {
    Bucket: process.env.bucket,
    Key: keyName,
    Body: passStream,
  };
  s3.upload(uploadParams, onDone);

  return passStream;
};

module.exports = {
  getDownloadStream,
  getUploadStream,
};
