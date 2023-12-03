//Job tests here
const Job = require("../src/Job");

describe("Job class tests", () => {
  test("Job execution function runs", () => {
    const job = new Job("job 1", "2s", () => {
      console.log("hello");
    });

    job.execute();
    expect(job._intervalId).not.toBe(null);
  });
  test("test job logging in the terminal", () => {
    console.log = jest.fn();
    const job = new Job("job 1", "2s", () => {
      log("hello");
    });

    job.execute();
    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith("hello");
    }, 3000);
  });
  // test("Job executes asynchronous function", async () => {
  //   const job = new Job("job 1", "10m", () => {
  //     return new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve("hello async world");
  //       }, 1000);
  //     });
  //   });

  //   const result = await job.execute();
  //   expect(result).toBe("hello async world");
  // });
});
