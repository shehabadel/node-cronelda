/**
 * @description function that converts time expression to Integer
 * to be used by the scheduler.
 * allowed expressions:
 * 1. "s" -> seconds
 * 2. "m" -> minutes
 * 3. "h" -> hours
 * 4. "d" -> days
 * 5. "w" -> weeks
 * 6. "M" -> months
 * 7. "y" -> years
 * @example '1s' -> 1000
 * @example '1h 10m' -> 4200000
 *
 * @param {string} time
 */
function parseTimeToInt(time) {
  const timeSplitted = time.split(" ");

  const timeFactors = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    w: 7 * 24 * 60 * 60 * 1000, // weeks
    M: 30 * 24 * 60 * 60 * 1000, // months (approximated as 30 days)
    y: 365 * 24 * 60 * 60 * 1000, // years (approximated as 365 days)
  };

  let totalMilliseconds = 0;

  for (const unit of timeSplitted) {
    const timeUnit = unit.slice(-1); // Extract the last character (unit)
    const timeValue = parseInt(unit); // Extract the numerical value
    if (timeFactors[timeUnit]) {
      totalMilliseconds += timeValue * timeFactors[timeUnit];
    }
  }

  return totalMilliseconds;
}
module.exports = {
  parseTimeToInt: parseTimeToInt,
};
