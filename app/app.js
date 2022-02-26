const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const { connectDb } = require('./config');
connectDb();

const routes = require('./routes/routes');
app.use('/api', routes);

// start remind service
const { ReminderService } = require('./services');
ReminderService.start();

app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

module.exports = app;
