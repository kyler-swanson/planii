exports.addDaysToDate = (currentDate, daysToAdd) => {
  return new Date(currentDate.setDate(currentDate.getDate() + daysToAdd));
};
