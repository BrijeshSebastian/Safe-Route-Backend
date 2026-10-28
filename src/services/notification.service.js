const notificationRepo = require('../repositories/notification.repository');
const AppError = require('../utils/AppError');
const { getPagination, getPagingData } = require('../utils/pagination');

class NotificationService {
  async createNotification({ userId, title, message, type, referenceId }) {
    return notificationRepo.create({
      user_id: userId,
      title,
      message,
      type,
      reference_id: referenceId,
    });
  }

  async getNotifications(userId, query) {
    const { page, size, is_read } = query;
    const { limit, offset } = getPagination(page, size);
    const data = await notificationRepo.findByUserId({
      userId,
      limit,
      offset,
      isRead: is_read !== undefined ? is_read === 'true' : undefined,
    });
    return getPagingData(data, page, limit);
  }

  async getNotificationDetails(notificationId, userId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }
    return notification;
  }

  async markRead(notificationId, userId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }
    return notificationRepo.markRead(notificationId);
  }

  async markAllRead(userId) {
    await notificationRepo.markAllRead(userId);
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }
    await notificationRepo.delete(notificationId);
    return { message: 'Notification deleted' };
  }
}

module.exports = new NotificationService();
