const router = require('express').Router();
const { validateCreateMovie, validateMovieId } = require('../middlewares/validator');

const controller = require('../controllers/movies');

router.get('/', controller.getMovies);
router.post('/', validateCreateMovie, controller.createMovie);
router.delete('/:movieId', validateMovieId, controller.deleteMovie);

module.exports = router;
