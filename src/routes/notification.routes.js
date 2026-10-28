const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationDetails);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
