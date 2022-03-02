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
    remindDate: {
      type: Date,
      required: false
    },
    remindNumber: {
      type: String,
      required: false
    },
    reminded: {
      type: Boolean,
      default: false
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

thingSchema.index({ remindDate: 1 });

module.exports = mongoose.model('Thing', thingSchema);
