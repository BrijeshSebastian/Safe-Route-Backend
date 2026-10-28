const { sendError } = require('../utils/response');
const errorCodes = require('../constants/errorCodes');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data; // replace with parsed/cleaned data
      next();
    } catch (err) {
      if (err.errors) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 422, 'Validation failed', errors, errorCodes.VALIDATION_001.code);
      }
      return sendError(res, 422, 'Validation failed');
    }
  };
};

module.exports = validate;
