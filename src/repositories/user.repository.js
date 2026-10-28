const { User } = require('../models');
const { Op } = require('sequelize');
const ROLES = require('../constants/roles');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findByPhone(phone) {
    return User.findOne({ where: { phone } });
  }

  async findById(id, includePassword = false) {
    const attributes = includePassword ? undefined : { exclude: ['password'] };
    return User.findByPk(id, { attributes });
  }

  async create(data) {
    return User.create(data);
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async updateLastKnownLocation(userId, latitude, longitude) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    return user.update(
      {
        last_known_latitude: latitude,
        last_known_longitude: longitude,
        last_location_at: new Date(),
      },
      { silent: true }
    );
  }

  async findAll({ page, limit, offset, role, search, isActive }) {
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.is_active = isActive;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    return User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async findAvailableResponders(responderType) {
    const where = {
      role: ROLES.RESPONDER,
      is_active: true,
    };
    if (responderType) where.responder_type = responderType;
    return User.findAll({
      where,
      attributes: { exclude: ['password'] },
    });
  }

  async countByRole(role) {
    return User.count({ where: { role } });
  }
}

module.exports = new UserRepository();
