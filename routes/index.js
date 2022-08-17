const router = require('express').Router();

const auth = require('../middlewares/auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { login, createUser } = require('../controllers/users');
const { validateRegist, validateLogin } = require('../middlewares/validator');

const NotFoundErr = require('../errors/NotFoundErr');
const { pageNotFoundErrorMessage } = require('../utils/constants');

router.post('/signup', validateRegist, createUser);
router.post('/signin', validateLogin, login);
router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('*', () => {
  throw new NotFoundErr(pageNotFoundErrorMessage);
});

module.exports = router;
