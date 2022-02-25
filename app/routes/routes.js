const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).json({ success: true, message: '' });
});

const Thing = require('../controllers/Thing/Thing.routing');
router.use('/', Thing);

module.exports = router;
