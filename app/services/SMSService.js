const twilio = require('twilio');

class SMSService {
  constructor(configObj) {
    this.fromNum = configObj.fromNum;
    this.client = new twilio(configObj.sid, configObj.token);
  }

  async sendSMS(msg, toNum) {
    const msg = await this.client.messages.create({
      body: msg,
      to: toNum,
      from: this.fromNum
    });

    return msg;
  }
}

module.exports = SMSService;
