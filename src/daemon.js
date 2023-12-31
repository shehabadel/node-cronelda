const Job = require("./Job");
let _jobs = new Map();

process.on("message", (message) => {
  switch (message.type) {
    case "get-jobs-data":
      if (message.data) {
        try {
          message.data?.forEach((job) => {
            var execution = new Function("return " + job.execution)();
            _jobs.set(
              job.name,
              new Job(job.name, job.time, execution, job?.options)
            );
          });
        } catch (error) {
          process.send("get-jobs-error", error);
        }
      }
      break;
    case "run-jobs":
      if (_jobs.size > 0) {
        console.log("DAEMON: -----Starting Daemon-----");
        startDaemon();
        process.send("daemon-isRunning");
      }
      break;
    case "stop-jobs":
      console.log("DAEMON: -----Stopping Daemon-----");
      stopDaemon();
      console.log("DAEMON: -----Stopped Daemon-----");
      process.send("daemon-stopped");
      break;
    case "execute-new-job":
      if (message.data) {
        const job = message.data;
        job.execution = new Function("return " + job.execution)();
        _jobs.set(
          job.name,
          new Job(job.name, job.time, job.execution, job?.options)
        );
        startJobByName(job.name);
      }
  }
});
/**
 * @description Runs the jobs received from the Scheduler.
 */
function startDaemon() {
  try {
    Array.from(_jobs.values()).forEach((job) => {
      job.execute();
    });
  } catch (error) {
    process.send("job-failed", error);
  }
}
/**
 * @description Calls `stopJob` method on each running job.
 */
function stopDaemon() {
  Array.from(_jobs.values()).forEach((job) => {
    job.stopJob();
  });
}
/**
 * @description Starts a job with a unique name.
 * @param {string} name
 */
function startJobByName(name) {
  const job = _jobs.get(name);
  job.execute();
}
