require('dotenv').config();

const { APP_NAME, PORT } = require('./config');
const app = require('./app');

app.listen(PORT, () => {
  console.log(`${APP_NAME}: listening on port ${PORT}...`);
});
