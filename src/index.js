const Scheduler = require("./Scheduler");

const jobsBulk = [
  {
    name: "job 1",
    time: "5s",
    execution: () => {
      console.log("x");
    },
    options: {
      once: true,
    },
  },
];
function main() {
  try {
    const scheduler = new Scheduler();
    scheduler.addBulkJobs(jobsBulk);
    scheduler.start();
    setTimeout(() => {
      scheduler.addJob({
        name: "job 2",
        time: "2s",
        execution: () => {
          return new Promise(() => {
            setTimeout(() => {
              console.log("hello world async after 2 seconds");
            }, 2000);
          });
        },
      });
    }, 9000);
  } catch (error) {
    console.error(error);
  }
}

main();
