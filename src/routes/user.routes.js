const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { uploadProfileImage } = require('../middlewares/upload.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/profile/image', uploadProfileImage, userController.uploadProfileImage);
router.delete('/profile/image', userController.removeProfileImage);
router.post('/change-password', validate(changePasswordSchema), userController.changePassword);
router.delete('/account', userController.deleteAccount);
router.post('/logout-all', userController.logoutAll);

module.exports = router;
