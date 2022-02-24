const mongoose = require('mongoose');

const thingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    desc: {
      type: String,
      required: false
    },
    dueDate: {
      type: Date,
      required: false
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    group: {
      type: String,
      required: false,
      trim: true,
      default: 'No group'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Thing', thingSchema);
