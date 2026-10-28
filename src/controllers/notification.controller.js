const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req.user.id, req.query);
      return sendSuccess(res, 200, 'Notifications retrieved', result.items, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getNotificationDetails(req, res, next) {
    try {
      const notification = await notificationService.getNotificationDetails(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Notification details retrieved', { notification });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markRead(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, 'Notification marked as read', { notification });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const result = await notificationService.markAllRead(req.user.id);
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(
        parseInt(req.params.id),
        req.user.id
      );
      return sendSuccess(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
