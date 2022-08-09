require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errors');
const { limiter } = require('./middlewares/limiter');
const { PORT, MONGO_URL } = require('./utils/config');

const router = require('./routes');

const app = express();

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('*', cors());
app.options('*', cors());

app.use('/', router);

app.use(helmet());
app.use(errorLogger);
app.use(limiter);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
