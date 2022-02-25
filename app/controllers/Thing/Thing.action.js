const { validate } = require('jsonschema');
const mongoose = require('mongoose');
const _ = require('lodash');

const Thing = require('../../models/Thing.model');
const { thingCreateSchema, thingUpdateSchema } = require('../../schemas');
const { rest } = require('lodash');

module.exports.getThings = async (req, res, next) => {
  const { sort, groupBy, order } = req.query;

  try {
    let things = [];
    let groups = [];

    things = await Thing.find({});

    // sort by a field
    if (sort !== undefined) {
      things = _.orderBy(things, [sort], [order || 'desc']);

      // group by a field
    } else if (groupBy !== undefined) {
      groups = _.groupBy(things, groupBy);
      groups = Object.keys(groups).map((group) => {
        return {
          group,
          things: groups[group]
        };
      });
    }

    if (!things) {
      return res.status(404).json({
        success: false,
        err: 'No things exist'
      });
    }

    let response = {
      success: true
    };

    if (groupBy !== undefined) {
      response[`${groupBy}s`] = groups;
    } else {
      response['things'] = things;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

module.exports.getThing = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      err: 'Invalid thing ID'
    });
  }

  try {
    const thing = await Thing.findById(id);

    if (!thing) {
      return res.status(404).json({
        success: false,
        err: 'Thing not found'
      });
    }

    res.json({
      success: true,
      thing: thing.toObject()
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

module.exports.createThing = async (req, res, next) => {
  const validationResult = validate(req.body, thingCreateSchema);
  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      err: validationResult.errors.map((e) => e.stack).join('. ')
    });
  }

  try {
    const thing = new Thing(req.body);

    // check for invalid dueDate
    if (thing.dueDate <= Date.now()) {
      return res.status(400).json({
        success: false,
        err: 'Invalid dueDate'
      });
    }

    const result = await thing.save();

    res.status(201).json({
      success: true,
      thing: result.toObject()
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

module.exports.updateThing = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      err: 'Invalid thing ID'
    });
  }

  const validationResult = validate(req.body, thingUpdateSchema);
  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      err: validationResult.errors.map((e) => e.stack).join('. ')
    });
  }

  try {
    const result = await Thing.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
      return res.status(404).json({
        success: false,
        err: `Thing with ID "${i}" not found`
      });
    }

    res.status(200).json({
      success: true,
      thing: result.toObject()
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

module.exports.deleteThing = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      err: 'Invalid thing ID'
    });
  }

  try {
    const result = await Thing.findByIdAndRemove(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        err: `Thing with ID "${id}" not found`
      });
    }

    res.json({
      success: true,
      thing: result
    });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};
