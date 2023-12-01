const Job = require("./Job");
const Scheduler = require("./Scheduler");

function main() {
  try {
    const job = new Job("job 1", 1000, () => {
      console.log("hello");
    });
    const job1 = {
      name: "job 1",
      time: "10m",
      execution: "x",
    };
    const scheduler = new Scheduler();
    scheduler.addJob(job);
    scheduler.addJob(job);
    scheduler.start();
    const result = job.execute();
  } catch (error) {
    console.error(error);
  }
}

main();
