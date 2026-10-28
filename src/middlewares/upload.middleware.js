const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { ensureUploadDir } = require('../utils/upload');

const uploadDir = path.resolve(__dirname, '../../', env.upload.dir);
ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extensions = { 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
    const ext = extensions[file.mimetype];
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

const uploadIncidentImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxImageSize, files: 5 },
}).array('images', 5);

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxProfileImageSize, files: 1 },
}).single('profile_image');

module.exports = { uploadIncidentImages, uploadProfileImage };
