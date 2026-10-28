const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, null, err.errorCode);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 400, 'File size exceeds the limit');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return sendError(res, 400, 'Too many files');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 400, 'Unexpected file field');
  }
  if (err.message === 'Only JPG, PNG, and WEBP images are allowed') {
    return sendError(res, 400, err.message);
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 400, 'Database validation error', errors);
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'Duplicate entry');
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
