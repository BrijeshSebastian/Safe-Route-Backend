const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  rejectIncidentSchema,
  assignResponderSchema,
  createResponderSchema,
  updateUserSchema,
} = require('../validators/admin.validator');
const ROLES = require('../constants/roles');

// All routes require admin role
router.use(authenticate, authorize(ROLES.ADMIN));

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports/monthly', adminController.getMonthlyReport);

// Incident management
router.get('/incidents', adminController.getAllIncidents);
router.get('/incidents/:id', adminController.getIncidentDetails);
router.patch('/incidents/:id/verify', adminController.verifyIncident);
router.patch('/incidents/:id/reject', validate(rejectIncidentSchema), adminController.rejectIncident);
router.post('/incidents/:id/assign', validate(assignResponderSchema), adminController.assignResponder);
router.post('/incidents/:id/reassign', validate(assignResponderSchema), adminController.reassignResponder);
router.delete('/assignments/:id', adminController.cancelAssignment);

// Responder management
router.get('/responders/available', adminController.getAvailableResponders);
router.post('/responders', validate(createResponderSchema), adminController.createResponder);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.patch('/users/:id/disable', adminController.disableUser);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:notificationId/read', adminController.markNotificationRead);

module.exports = router;
