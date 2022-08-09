const Movie = require('../models/movies');

const NotFoundErr = require('../errors/NotFoundErr');
const ForbiddenErr = require('../errors/ForbiddenErr');

const { movieDataErrorMessage } = require('../utils/constants');
const { movieIdErrorMessage } = require('../utils/constants');
const { movieDeleteErrorMessage } = require('../utils/constants');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
    owner = req.user._id,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
    owner,
    movieId,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotFoundErr(movieDataErrorMessage));
      } else {
        next(err);
      }
    });
};

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.findOne({ _id: req.params.movieId })
    .orFail(() => {
      throw new NotFoundErr(movieIdErrorMessage);
    })
    .then((movie) => {
      if (String(movie.owner) !== owner) {
        throw new ForbiddenErr(movieDeleteErrorMessage);
      }
      return Movie.findByIdAndRemove(movie._id).select('-owner');
    })
    .then((movie) => {
      res.status(200).send({
        deleteMovie: movie,
      });
    })
    .catch(next);
};
