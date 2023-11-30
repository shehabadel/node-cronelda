const Job = require("./Job");
const job = new Job("job 1", "10m", () => {
  console.log("hello");
  return "x";
});
const result = job.execute();
console.log(result);
