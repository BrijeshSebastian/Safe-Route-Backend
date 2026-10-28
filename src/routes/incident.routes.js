const router = require('express').Router();
const incidentController = require('../controllers/incident.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const { uploadIncidentImages } = require('../middlewares/upload.middleware');
const { createIncidentSchema, updateIncidentSchema, idParamsSchema, incidentQuerySchema, nearbyQuerySchema } = require('../validators/incident.validator');
const ROLES = require('../constants/roles');

// All routes require authentication
router.use(authenticate);

// Reporter routes
router.post('/', authorize(ROLES.REPORTER), validate(createIncidentSchema), incidentController.createIncident);
router.post('/:id/images', validate(idParamsSchema, 'params'), authorize(ROLES.REPORTER), uploadIncidentImages, incidentController.uploadImages);
router.get('/my', authorize(ROLES.REPORTER), validate(incidentQuerySchema, 'query'), incidentController.getMyIncidents);
router.patch('/:id/cancel', validate(idParamsSchema, 'params'), authorize(ROLES.REPORTER), incidentController.cancelIncident);
router.put('/:id', validate(idParamsSchema, 'params'), authorize(ROLES.REPORTER), validate(updateIncidentSchema), incidentController.updateIncident);
router.delete('/:id', validate(idParamsSchema, 'params'), authorize(ROLES.REPORTER), incidentController.deleteIncident);

// Platform-wide discovery is restricted to administrators; reporters and responders
// can only retrieve incidents they own or are assigned through the routes below.
router.get('/search', authorize(ROLES.ADMIN), validate(incidentQuerySchema, 'query'), incidentController.searchIncidents);
router.get('/nearby', authorize(ROLES.ADMIN), validate(nearbyQuerySchema, 'query'), incidentController.getNearbyIncidents);
router.get('/:id/responder-location', validate(idParamsSchema, 'params'), authorize(ROLES.REPORTER, ROLES.ADMIN), incidentController.getResponderLocation);
router.get('/:id/status-history', validate(idParamsSchema, 'params'), incidentController.getStatusHistory);
router.get('/:id', validate(idParamsSchema, 'params'), incidentController.getIncidentDetails);

module.exports = router;
