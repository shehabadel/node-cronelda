const Job = require("./Job");
const job = new Job("job 1", "10m", () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello async world");
    }, 1000);
  });
});
const result = job.execute().then((result) => result);
