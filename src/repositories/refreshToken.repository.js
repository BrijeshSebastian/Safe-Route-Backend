const { RefreshToken } = require('../models');

class RefreshTokenRepository {
  async create(data, options) {
    return RefreshToken.create(data, options);
  }

  async findByToken(token, options) {
    return RefreshToken.findOne({ where: { token }, ...options });
  }

  async deleteByToken(token, options) {
    return RefreshToken.destroy({ where: { token }, ...options });
  }

  async deleteAllByUserId(userId, options) {
    return RefreshToken.destroy({ where: { user_id: userId }, ...options });
  }
}

module.exports = new RefreshTokenRepository();
