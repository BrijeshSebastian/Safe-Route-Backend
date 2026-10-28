const router = require('express').Router();

const authRoutes = require('./auth.routes');
const incidentRoutes = require('./incident.routes');
const responderRoutes = require('./responder.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const fileRoutes = require('./file.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'SafeRoute API is running', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/responders', responderRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/files', fileRoutes);

module.exports = router;
