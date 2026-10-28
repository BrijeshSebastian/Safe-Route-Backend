const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requireSecret = (name) => {
  const value = process.env[name];
  if (process.env.NODE_ENV !== 'test' && (!value || value.startsWith('default_') || value.startsWith('your_'))) {
    throw new Error(`${name} must be configured with a strong, non-default value`);
  }
  return value || 'test-only-secret';
};

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'saferoute_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: requireSecret('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: requireSecret('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5242880,
    maxProfileImageSize: parseInt(process.env.MAX_PROFILE_IMAGE_SIZE, 10) || 2097152,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  },
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
