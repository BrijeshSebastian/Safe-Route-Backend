const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return sendSuccess(res, 201, 'User registered successfully', { user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      return sendSuccess(res, 200, 'Login successful', data);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const tokens = await authService.refreshToken(req.body);
      return sendSuccess(res, 200, 'Tokens refreshed', tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.body);
      return sendSuccess(res, 200, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword({
        userId: req.user.id,
        ...req.body,
      });
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
