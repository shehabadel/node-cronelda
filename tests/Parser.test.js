const parseTimeToInt = require("../src/Parser").parseTimeToInt;
describe("Parser functions tests", () => {
  test("time string should be converted successfully", () => {
    const time = parseTimeToInt("1s 2m");
    expect(time).toBe(121000);
  });
});
