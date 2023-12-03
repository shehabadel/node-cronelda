const Job = require("./Job");
let _jobs = new Map();

process.on("message", (message) => {
  switch (message.type) {
    case "get-jobs-data":
      if (message.data) {
        message.data?.forEach((job) => {
          var execution = new Function("return " + job.execution)();
          _jobs.set(
            job.name,
            new Job(job.name, job.time, execution, job?.options)
          );
        });
      }
      break;
    case "run-jobs":
      if (_jobs.size > 0) {
        console.log("-----Starting Daemon-----");
        startDaemon();
        process.send("daemon-isRunning");
      }
      break;
    case "stop-jobs":
      console.log("-----Stopping Daemon-----");
      stopDaemon();
      console.log("-----Stopped Daemon-----");
      process.send("daemon-stopped");
      break;
    case "execute-new-job":
      if (message.data) {
        const job = message.datta;
        job.execution = new Function("return " + job.execution)();
        _jobs.set(
          job.name,
          new Job(job.name, job.time, job.execution, job?.options)
        );
      }
  }
});

function startDaemon() {
  Array.from(_jobs.values()).forEach((job) => {
    job.execute();
  });
}
function stopDaemon() {
  Array.from(_jobs.values()).forEach((job) => {
    job.stopJob();
  });
}
