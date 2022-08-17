const router = require('express').Router();
const { validateProfile } = require('../middlewares/validator');
const controller = require('../controllers/users');

router.get('/me', controller.getUserInfo);
router.patch('/me', validateProfile, controller.updateProfile);

module.exports = router;
