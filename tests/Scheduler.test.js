//Job tests here
const { scheduler } = require("timers/promises");
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
    const job = new Job("job 2", "10m", () => {
      console.log("world");
    });

    const scheduler = new Scheduler();
    scheduler.addJob(job);
    const jobsLength = scheduler.getJobsLength();
    expect(jobsLength).toBe(1);
  });

  test("Throws error on adding a job with a name that already exists", () => {
    const job1 = new Job("job 2", "10m", () => {
      console.log("world");
    });
    const job2 = new Job("job 2", "10m", () => {
      console.log("world");
    });

    const scheduler = new Scheduler();

    const mockCallback = jest.fn();
    scheduler.on("task-add-failed", mockCallback);
    scheduler.addJob(job1);
    scheduler.addJob(job2);
    expect(mockCallback).toHaveBeenCalled();
  });
});
