const mongoose = require('mongoose');

const APP_NAME = 'planii';
const ENV = process.env.NODE_ENV || 'dev';
const PORT = process.env.PORT || 8080;
const MONGODB_HOST = process.env.MONGODB_HOST || '127.0.0.1';
const MONGODB_COLLECTION = `${APP_NAME}__${ENV}`;
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://${MONGODB_HOST}/${MONGODB_COLLECTION}`;

const connectDb = async () => {
  mongoose.Promise = Promise;

  try {
    await mongoose.connect(MONGODB_URI);

    console.log(`${APP_NAME} successfully connected to database.`);
  } catch (err) {
    // Dump stack
    console.error('Could not connect to MongoDB. ' + err);

    // Exit with error code 1
    process.exit(1);
  }
};

module.exports = {
  APP_NAME,
  ENV,
  PORT,
  MONGODB_COLLECTION,
  connectDb
};
