const { sleep } = require('../helpers/ServiceHelper');
const { addSecToDate } = require('../helpers/DateHelper');

const Thing = require('../models/Thing.model');
const { SMSService } = require('.');

const CLOCK = 2000; // ms
const BOUNDS = 10; // sec

class ReminderService {
  static async start() {
    const sms = new SMSService({
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
      fromNum: process.env.TWILIO_NUM
    });

    while (true) {
      await sleep(CLOCK);

      // reminder boundaries
      const gte = addSecToDate(Date.now(), -BOUNDS);
      const lte = addSecToDate(Date.now(), +BOUNDS);

      const toRemind = Thing.find({ remindDate: { $gte: gte, $lte: lte }, reminded: false });
      toRemind.forEach((thing) => {
        const msg = await sms.sendSMS(`plannii: ${thing.title} is due at ${thing.dueDate}!`, thing.remindNumber);

        thing.reminded = true;
        thing.save();
      });
    }
  }
}

module.exports = ReminderService;
