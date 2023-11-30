//Job tests here
const Job = require("../src/Job");

describe("Job class tests", () => {
  test('Job execution function returns "x"', () => {
    const job = new Job("job 1", "10m", () => {
      console.log("hello");
      return "x";
    });

    const result = job.execute();
    expect(result).toBe("x");
  });

  test("Job emits task finished event", () => {
    const job = new Job("job 2", "10m", () => {
      console.log("world");
      return "y";
    });

    const mockCallback = jest.fn();
    job.on("task finished", mockCallback);

    job.execute();
    expect(mockCallback).toHaveBeenCalled();
  });

  test("Job emits task failed event when execution fails", () => {
    const job = new Job("job 3", "10m", () => {
      throw new Error("Execution error");
    });

    const mockCallback = jest.fn();
    job.on("task failed", mockCallback);

    job.execute();
    expect(mockCallback).toHaveBeenCalledWith(new Error("Execution error"));
  });
});
