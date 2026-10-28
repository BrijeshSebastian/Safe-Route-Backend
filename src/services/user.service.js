const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const AppError = require('../utils/AppError');
const errorCodes = require('../constants/errorCodes');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { validateImageFile, deleteFile } = require('../utils/upload');

class UserService {
  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    return user;
  }

  async updateProfile(userId, data) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }

    // Prevent updating sensitive fields
    const { password, role, is_active, ...safeData } = data;

    // Check unique constraints if email/phone changed
    if (safeData.email && safeData.email !== user.email) {
      const existing = await userRepo.findByEmail(safeData.email);
      if (existing) throw new AppError('Email already in use', 409, errorCodes.USER_002.code);
    }
    if (safeData.phone && safeData.phone !== user.phone) {
      const existing = await userRepo.findByPhone(safeData.phone);
      if (existing) throw new AppError('Phone already in use', 409, errorCodes.USER_002.code);
    }

    await userRepo.update(userId, safeData);
    return userRepo.findById(userId);
  }

  async uploadProfileImage(userId, file) {
    if (!file) {
      throw new AppError('No image file provided', 400);
    }
    if (!validateImageFile(file)) {
      deleteFile(file.filename);
      throw new AppError('Uploaded file is not a valid image', 400);
    }
    const user = await userRepo.findById(userId);
    if (user.profile_image) deleteFile(user.profile_image);
    const imageUrl = `/api/v1/files/${file.filename}`;
    await userRepo.update(userId, { profile_image: imageUrl });
    return userRepo.findById(userId);
  }

  async removeProfileImage(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    if (user.profile_image) deleteFile(user.profile_image);
    await userRepo.update(userId, { profile_image: null });
    return userRepo.findById(userId);
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const { User } = require('../models');
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, errorCodes.AUTH_001.code);
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepo.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, errorCodes.USER_001.code);
    }
    await userRepo.update(userId, { is_active: false });
    await refreshTokenRepo.deleteAllByUserId(userId);
    return { message: 'Account deactivated' };
  }

  async logoutAll(userId) {
    await refreshTokenRepo.deleteAllByUserId(userId);
    return { message: 'All sessions logged out' };
  }
}

module.exports = new UserService();
