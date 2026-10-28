const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      return sendSuccess(res, 200, 'Profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, 200, 'Profile updated', { user });
    } catch (err) {
      next(err);
    }
  }

  async uploadProfileImage(req, res, next) {
    try {
      const user = await userService.uploadProfileImage(req.user.id, req.file);
      return sendSuccess(res, 200, 'Profile image uploaded', { user });
    } catch (err) {
      next(err);
    }
  }

  async removeProfileImage(req, res, next) {
    try {
      const user = await userService.removeProfileImage(req.user.id);
      return sendSuccess(res, 200, 'Profile image removed', { user });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await userService.changePassword(req.user.id, req.body);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const result = await userService.deleteAccount(req.user.id);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const result = await userService.logoutAll(req.user.id);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
