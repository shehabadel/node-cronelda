const Scheduler = require("../src/Scheduler");

describe("Scheduler class tests", () => {
  let scheduler;
  beforeEach(() => {
    scheduler = new Scheduler();
    scheduler.setDaemonPath("./src/daemon.js");
  });

  afterEach(() => {
    scheduler.stop();
    scheduler.clearJobs();
  });

  test("Scheduler runs successfully on start", () => {
    scheduler.start();
    setTimeout(() => {
      const isRunning = scheduler.isRunning();
      expect(isRunning).toBe(true);
    }, 3000);
  });

  test("Add jobs to scheduler successfully", () => {
    const job = {
      name: "job 5",
      time: "10m",
      execution: () => {
        console.log("world");
      },
    };

    scheduler.addJob(job);
    setTimeout(() => {
      const jobsLength = scheduler.getJobsLength();
      expect(jobsLength).toBe(1);
    }, 3000);
  });

  test("Throws error on adding a job with a name that already exists", () => {
    const job1 = {
      name: "job 2",
      time: "10m",
      execution: () => {
        console.log("world");
      },
    };
    const job2 = {
      name: "job 2",
      time: "10m",
      execution: () => {
        console.log("world");
      },
    };

    const mockCallback = jest.fn();
    scheduler.on("task-add-failed", mockCallback);
    expect(() => {
      scheduler.addJob(job1);
      scheduler.addJob(job2);
    }).toThrowError("job 2 already exists!");
  });
});
