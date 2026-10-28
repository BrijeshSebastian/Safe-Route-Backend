const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const uploadDir = path.resolve(__dirname, '../../', env.upload.dir);
const ensureUploadDir = () => fs.mkdirSync(uploadDir, { recursive: true });

const validateImageFile = (file) => {
  const bytes = fs.readFileSync(file.path);
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return isJpeg || isPng || isWebp;
};

/**
 * Save file to local disk and return the relative path
 */
const saveFile = (file) => {
  return `/${env.upload.dir}/${file.filename}`;
};

/**
 * Delete file from local disk
 */
const deleteFile = (filePath) => {
  const fullPath = path.join(uploadDir, path.basename(filePath));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { ensureUploadDir, uploadDir, validateImageFile, saveFile, deleteFile };
