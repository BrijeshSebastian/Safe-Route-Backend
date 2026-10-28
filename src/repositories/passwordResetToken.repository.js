const { PasswordResetToken } = require('../models');

class PasswordResetTokenRepository {
  create(data, options) { return PasswordResetToken.create(data, options); }
  findByHash(tokenHash, options) { return PasswordResetToken.findOne({ where: { token_hash: tokenHash }, ...options }); }
  deleteByHash(tokenHash, options) { return PasswordResetToken.destroy({ where: { token_hash: tokenHash }, ...options }); }
  deleteAllByUserId(userId, options) { return PasswordResetToken.destroy({ where: { user_id: userId }, ...options }); }
}

module.exports = new PasswordResetTokenRepository();
