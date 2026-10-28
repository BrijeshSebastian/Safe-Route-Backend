const router = require('express').Router();
const authenticate = require('../middlewares/auth.middleware');
const fileController = require('../controllers/file.controller');

router.get('/:filename', authenticate, fileController.getImage);

module.exports = router;
