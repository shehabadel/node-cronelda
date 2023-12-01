const Scheduler = require("./Scheduler");
const jobsBulk = [
  {
    name: "job 1",
    time: "10m",
    execution: () => {
      console.log("x");
    },
  },
  {
    name: "job 2",
    time: "10m",
    execution: () => {
      return new Promise(() => {
        setTimeout(() => {
          console.log("hello world async after 6 seconds");
        }, 6000);
      });
    },
  },
  {
    name: "job 3",
    time: "10m",
    execution: () => {
      return new Promise(() => {
        setTimeout(() => {
          console.log("hello world async after 1 second - 1");
        }, 1000);
      });
    },
  },
  {
    name: "job 4",
    time: "10m",
    execution: () => {
      return new Promise(() => {
        setTimeout(() => {
          console.log("hello world async after 2 seconds - 1");
        }, 2000);
      });
    },
  },
  {
    name: "job 5",
    time: "10m",
    execution: () => {
      return new Promise(() => {
        setTimeout(() => {
          console.log("hello world async after 1 second - 2");
        }, 1000);
      });
    },
  },
  {
    name: "job 6",
    time: "10m",
    execution: () => {
      return new Promise(() => {
        setTimeout(() => {
          console.log("hello world async after 2 seconds - 2");
        }, 2000);
      });
    },
  },
];
function main() {
  try {
    const scheduler = new Scheduler();
    jobsBulk.forEach((job) => {
      scheduler.addJob(job);
    });
    scheduler.start();
  } catch (error) {
    console.error(error);
  }
}

main();
