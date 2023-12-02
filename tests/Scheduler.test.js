//Job tests here
const Job = require("../src/Job");
const Scheduler = require("../src/Scheduler");

describe("Scheduler class tests", () => {
  test("Scheduler runs successfully on start", () => {
    const scheduler = new Scheduler();
    scheduler.start();
    const isRunning = scheduler.isRunning();
    expect(isRunning).toBe(true);
  });

  test("Add jobs to scheduler successfully", () => {
    const job = {
      name: "job 2",
      time: "10m",
      execution: () => {
        console.log("world");
      },
    };

    const scheduler = new Scheduler();
    scheduler.addJob(job);
    const jobsLength = scheduler.getJobsLength();
    expect(jobsLength).toBe(1);
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

    const scheduler = new Scheduler();

    const mockCallback = jest.fn();
    scheduler.on("task-add-failed", mockCallback);
    scheduler.addJob(job1);
    scheduler.addJob(job2);
    expect(mockCallback).toThrow("job 2 already exists!");
    expect(mockCallback).toHaveBeenCalled();
  });
});
