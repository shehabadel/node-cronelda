//index.js
const Scheduler = require("./Scheduler");
const jobsBulk = [
  {
    name: "job 1",
    time: "5s",
    execution: () => {
      console.log("hello world - logged once");
    },
    options: {
      once: true,
    },
  },
  {
    name: "job 3",
    time: "6s",
    execution: () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("hello world async after 1 second ");
          resolve();
        }, 3000);
      });
    },
  },
  // {
  //   name: "job 4",
  //   time: "6s",
  //   execution: () => {
  //     return new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         console.log("hello world async after 1 second ");
  //         resolve();
  //       }, 1000);
  //     });
  //   },
  // },
  // {
  //   name: "job 4",
  //   time: "2s",
  //   execution: () => {
  //     console.log("hello world - job 4");
  //   },
  // },

  // {
  //   name: "job 6",
  //   time: "20s",
  //   execution: () => {
  //     return new Promise(() => {
  //       setTimeout(() => {
  //         console.log("hello world async after 20 seconds");
  //       }, 20000);
  //     });
  //   },
  // },
];
function main() {
  try {
    const scheduler = new Scheduler();
    scheduler.addBulkJobs(jobsBulk);
    scheduler.start();
  } catch (error) {
    console.error(error);
  }
}
main();
