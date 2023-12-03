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

  test("test job interval set to max time", () => {
    const job = new Job("job 1", "28d", () => {
      log("hello");
    });

    expect(job._interval).toBe(2147483647);
  });

  test("test adding wrong function argument", () => {
    expect(() => {
      const job = new Job("job 1", "28d", "x");
    }).toThrow("execution parameter must be a function!");
  });

  test("test job-failed event", () => {
    const job = new Job("job 1", "28d", () => {
      throw new Error("Something has happened");
    });
    const mockCallback = jest.fn();
    job.on("job-failed", mockCallback);
    job.execute();
    setTimeout(() => {
      expect(mockCallback).toHaveBeenCalled();
    }, 2000);
  });

  test("returns the job name", () => {
    const job = new Job("job 1", "28d", () => {
      console.log("hello");
    });
    expect(job.getName()).toBe("job 1");
  });

  test("returns the job interval", () => {
    const job = new Job("job 1", "1s", () => {
      console.log("hello");
    });
    expect(job.getInterval()).toBe(1000);
  });

  test("returns whether the job runs only once", () => {
    const job = new Job(
      "job 1",
      "28d",
      () => {
        console.log("hello");
      },
      { once: true }
    );
    expect(job.getOnce()).toBe(true);
  });

  test("stops the job execution", () => {
    const job = new Job("job 1", "1s", () => {
      console.log("hello");
    });
    job.execute();
    setTimeout(() => {
      job.stopJob();
      expect(job.getIntervalId()).toBe(null);
    }, 1000);
  });
});
