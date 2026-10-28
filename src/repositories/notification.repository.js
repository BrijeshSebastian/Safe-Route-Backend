const { Notification } = require('../models');

class NotificationRepository {
  async create(data, options) {
    return Notification.create(data, options);
  }

  async findByUserId({ userId, limit, offset, isRead }) {
    const where = { user_id: userId };
    if (isRead !== undefined) where.is_read = isRead;
    return Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id) {
    return Notification.findByPk(id);
  }

  async markRead(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    return notification.update({ is_read: true });
  }

  async markAllRead(userId) {
    return Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
  }

  async delete(id) {
    return Notification.destroy({ where: { id } });
  }

  async countUnread(userId) {
    return Notification.count({ where: { user_id: userId, is_read: false } });
  }
}

module.exports = new NotificationRepository();
