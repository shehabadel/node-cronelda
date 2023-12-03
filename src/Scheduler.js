const EventEmitter = require("events");
const { fork } = require("child_process");
class Scheduler extends EventEmitter {
  constructor() {
    super();
    this._jobs = [];
    this._daemonProcess = null;
    this._isRunning = false;
    this.on("scheduler-stop", () => {
      console.log("---Stopping scheduler---");
      this.stopScheduler();
    });
  }
  addJob(jobObj) {
    try {
      // if (this._jobs[job.getName()]) {
      //   throw new Error(`${job.getName()} already exists!`);
      // }
      this._jobs.push(jobObj);
      if (this.isRunning()) {
        this._daemonProcess.send({
          type: "execute-new-job",
          data: {
            ...jobObj,
            execution: jobObj.execution.toString(),
          },
        });
      }
    } catch (error) {
      console.error(`Couldn't add ${jobObj.name} as it is already exists`);
      this.emit("task-add-failed");
      throw error;
    }
  }
  start() {
    this._daemonProcess = fork("./daemon.js");
    const jobsToSend = this._jobs.map((job) => {
      job.execution = job.execution.toString();
      return job;
    });
    this._daemonProcess.send({
      type: "get-jobs-data",
      data: jobsToSend,
    });

    this._daemonProcess.send({
      type: "run-jobs",
    });

    this._daemonProcess.on("message", (message) => {
      if (message === "daemon-isRunning") {
        this._isRunning = true;
      }
    });
  }

  stop() {
    this.emit("scheduler-stop");
  }
  isRunning() {
    return this._isRunning;
  }
  getJobsLength() {
    return this._jobs.size;
  }

  stopScheduler() {
    if (this.isRunning()) {
      this._daemonProcess.send({
        type: "stop-jobs",
      });
      this._daemonProcess.on("message", (message) => {
        if (message === "daemon-stopped") this._daemonProcess.kill();
        console.log("---Stopped scheduler---");
      });
    }
  }
  getJobs() {
    return this._jobs;
  }
}
module.exports = Scheduler;
