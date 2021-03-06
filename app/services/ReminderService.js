const { sleep } = require('../helpers/ServiceHelper');
const { addSecToDate } = require('../helpers/DateHelper');

const Thing = require('../models/Thing.model');
const SMSService = require('./SMSService');

const CLOCK = 2000; // ms

class ReminderService {
  static async start() {
    // init new sms service object
    const sms = new SMSService({
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
      fromNum: process.env.TWILIO_NUM
    });

    while (true) {
      await sleep(CLOCK);
      const now = new Date(Date.now());

      // look for all things that have not reminded someone yet (in the past)
      const toRemind = await Thing.find({ remindDate: { $lte: now }, reminded: false });

      toRemind.forEach(async (thing) => {
        if (thing.remindNumber) {
          await sms.sendSMS(`Plannii: ${thing.title} is due at ${thing.dueDate}!`, thing.remindNumber);
          console.log('Planii: reminder sent to ' + thing.remindNumber + '!');

          thing.reminded = true;
          thing.save();
        }
      });
    }
  }
}

module.exports = ReminderService;
