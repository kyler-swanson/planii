exports.addDaysToDate = (date, daysToAdd) => {
  return new Date(date.setDate(date.getDate() + daysToAdd)).toISOString();
};

exports.addSecToDate = (date, sec) => {
  return date.setSeconds(date.getSeconds() + sec);
};
