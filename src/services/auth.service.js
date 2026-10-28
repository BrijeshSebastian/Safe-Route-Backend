const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const passwordResetTokenRepo = require('../repositories/passwordResetToken.repository');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const errorCodes = require('../constants/errorCodes');
const ROLES = require('../constants/roles');
const crypto = require('crypto');
const transporter = require('../config/email');
const env = require('../config/env');
const { sequelize } = require('../models');
const logger = require('../utils/logger');

class AuthService {
  async register({ full_name, email, phone, password }) {
    // Check duplicate email
    const existingEmail = await userRepo.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Email already registered', 409, errorCodes.USER_002.code);
    }
    // Check duplicate phone
    const existingPhone = await userRepo.findByPhone(phone);
    if (existingPhone) {
      throw new AppError('Phone number already registered', 409, errorCodes.USER_002.code);
    }

    const hashedPassword = await hashPassword(password);
    const user = await userRepo.create({
      full_name,
      email,
      phone,
      password: hashedPassword,
      role: ROLES.REPORTER,
    });

    const userData = user.toJSON();
    delete userData.password;
    return userData;
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, errorCodes.AUTH_001.code);
    }
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, errorCodes.AUTH_001.code);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { exp } = verifyRefreshToken(refreshToken);
    await refreshTokenRepo.create({
      user_id: user.id,
      token: hashToken(refreshToken),
      expires_at: new Date(exp * 1000),
    });

    const userData = user.toJSON();
    delete userData.password;

    return {
      user: userData,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({ refreshToken }) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify stored token exists
    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepo.findByToken(tokenHash);
    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401, errorCodes.AUTH_002.code);
    }

    // Check expiry
    if (new Date() > storedToken.expires_at) {
      await refreshTokenRepo.deleteByToken(tokenHash);
      throw new AppError('Refresh token expired', 401, errorCodes.AUTH_002.code);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await userRepo.findById(decoded.id);
      if (!user || !user.is_active) {
        throw new AppError('User not found', 404, errorCodes.USER_001.code);
      }

      // Rotate tokens
      await refreshTokenRepo.deleteByToken(tokenHash);

      const payload = { id: user.id, email: user.email, role: user.role };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      const { exp } = verifyRefreshToken(newRefreshToken);
      await refreshTokenRepo.create({
        user_id: user.id,
        token: hashToken(newRefreshToken),
        expires_at: new Date(exp * 1000),
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid refresh token', 401, errorCodes.AUTH_002.code);
    }
  }

  async logout({ refreshToken }) {
    if (refreshToken) {
      await refreshTokenRepo.deleteByToken(hashToken(refreshToken));
    }
  }

  async forgotPassword({ email }) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await passwordResetTokenRepo.deleteAllByUserId(user.id);
    await passwordResetTokenRepo.create({ user_id: user.id, token_hash: resetTokenHash, expires_at: expiresAt });

    const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'SafeRoute password reset',
        text: `Use this link within 15 minutes to reset your SafeRoute password: ${resetUrl}`,
      });
    } catch (err) {
      await passwordResetTokenRepo.deleteByHash(resetTokenHash);
      logger.error('Password reset email delivery failed', { userId: user.id, error: err.message });
    }
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword({ token, newPassword }) {
    try {
      const tokenHash = hashToken(token);
      await sequelize.transaction(async (transaction) => {
        const resetToken = await passwordResetTokenRepo.findByHash(tokenHash, { transaction, lock: transaction.LOCK.UPDATE });
        if (!resetToken || resetToken.expires_at < new Date()) {
          throw new AppError('Invalid or expired reset token', 400, errorCodes.AUTH_002.code);
        }
        const hashedPassword = await hashPassword(newPassword);
        const { User } = require('../models');
        await User.update({ password: hashedPassword }, { where: { id: resetToken.user_id }, transaction });
        await refreshTokenRepo.deleteAllByUserId(resetToken.user_id, { transaction });
        await passwordResetTokenRepo.deleteAllByUserId(resetToken.user_id, { transaction });
      });

      return { message: 'Password reset successfully' };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired reset token', 400, errorCodes.AUTH_002.code);
    }
  }

  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await userRepo.findById(userId, true);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }

    // findById with includePassword=true still uses exclude, let's query directly
    const { User } = require('../models');
    const fullUser = await User.findByPk(userId);

    const isMatch = await comparePassword(currentPassword, fullUser.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, errorCodes.AUTH_001.code);
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepo.update(userId, { password: hashedPassword });
    await refreshTokenRepo.deleteAllByUserId(userId);

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
