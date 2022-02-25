const express = require('express');
const router = express.Router();

const { getThings, getThing, createThing, updateThing, deleteThing } = require('./Thing.action');

router.get('/thing/', getThings);
router.get('/thing/:id', getThing);
router.post('/thing', createThing);
router.patch('/thing/:id', updateThing);
router.delete('/thing/:id', deleteThing);

module.exports = router;
