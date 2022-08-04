const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');

const NotFoundErr = require('../errors/NotFoundErr');
const AuthorizationErr = require('../errors/AuthorizationErr');
const ConflictErr = require('../errors/ConflictErr');
const BadRequestErr = require('../errors/BadRequestErr');

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictErr('Введенная почта уже используется');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      });
    })
    .then((user) => {
      const { _id } = user;
      res.send({
        name,
        email,
        _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные при создании профиля'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }, '+password')
    .then((user) => {
      if (!user) {
        return next(new AuthorizationErr('Введен не корректный логин или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((isValid) => {
          if (!isValid) {
            return next(new AuthorizationErr('Введен не корректный логин или пароль'));
          }
          return user;
        });
    })
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('token', token);
      res.send({ jwt: token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUserInfo = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .orFail(() => {
      throw new NotFoundErr('Пользователь не найден');
    })
    .then((user) => {
      const { name, email } = user;
      const userData = { name, email };

      res.send(userData);
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true, upsert: true },
  )
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные при создании профиля'));
      } if (err.code === 11000) {
        next(new ConflictErr('Данный e-mail уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};
