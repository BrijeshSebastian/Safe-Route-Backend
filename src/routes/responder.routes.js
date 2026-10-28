const router = require('express').Router();
const responderController = require('../controllers/responder.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');
const validate = require('../middlewares/validation.middleware');
const { idParamsSchema, optionalNotesSchema, locationSchema } = require('../validators/responder.validator');

// All routes require responder role
router.use(authenticate, authorize(ROLES.RESPONDER));

router.get('/dashboard', responderController.getDashboard);
router.get('/incidents', responderController.getAssignedIncidents);
router.get('/incidents/completed', responderController.getCompletedHistory);
router.get('/incidents/:id', validate(idParamsSchema, 'params'), responderController.getAssignmentDetails);
router.patch('/incidents/:id/accept', validate(idParamsSchema, 'params'), responderController.acceptAssignment);
router.patch('/incidents/:id/reject', validate(idParamsSchema, 'params'), validate(optionalNotesSchema), responderController.rejectAssignment);
router.patch('/incidents/:id/start-travel', validate(idParamsSchema, 'params'), responderController.startTravel);
router.patch('/incidents/:id/arrived', validate(idParamsSchema, 'params'), responderController.arrived);
router.patch('/incidents/:id/resolve', validate(idParamsSchema, 'params'), validate(optionalNotesSchema), responderController.resolveIncident);
router.post('/location', validate(locationSchema), responderController.updateLocation);
router.get('/notifications', responderController.getNotifications);
router.patch('/notifications/:notificationId/read', responderController.markNotificationRead);

module.exports = router;
