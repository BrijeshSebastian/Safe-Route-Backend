const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return sendError(res, 401, 'User not found');
    }
    if (!user.is_active) {
      return sendError(res, 403, 'Account is deactivated');
    }
    if (decoded.iat && new Date(user.updated_at).getTime() > decoded.iat * 1000) {
      return sendError(res, 401, 'Access token has been revoked');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token expired');
    }
    return sendError(res, 401, 'Invalid access token');
  }
};

module.exports = authenticate;
