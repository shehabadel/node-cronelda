const EventEmitter = require("events");
const { fork } = require("child_process");
const DAEMON_PATH = "./daemon.js";
class Scheduler extends EventEmitter {
  constructor() {
    super();
    this._jobs = [];
    this._daemonProcess = null;
    this._daemonPath = DAEMON_PATH;
    this._isRunning = false;
    this.on("scheduler-stop", () => {
      console.log("SCHEDULER: ---Stopping scheduler---");
      this.stopScheduler();
    });
    this.on("scheduler-start", () => {
      console.log("SCHEDULER: ---Starting scheduler---");
      this.startScheduler();
    });
    this.on("task-add-failed", (error) => {
      throw error;
    });
  }
  addJob(jobObj) {
    try {
      if (this.jobExists(jobObj.name)) {
        throw new Error(`${jobObj.name} already exists!`);
      }
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
      // console.error(
      //   `SCHEDULER: Couldn't add ${jobObj.name} as it is already exists`
      // );
      this.emit("task-add-failed", error);
    }
  }
  startScheduler() {
    if (!this._isRunning) {
      this._daemonProcess = fork(this._daemonPath);
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
      this.setupErrorDelegators();
    } else {
      console.log("SCHEDULER: the scheduler is already running!");
    }
  }
  start() {
    this.emit("scheduler-start");
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
        this._isRunning = false;
        console.log("SCHEDULER: ---Stopped scheduler---");
      });
    }
  }
  getJobs() {
    return this._jobs;
  }

  jobExists(jobName) {
    return this._jobs.some((job) => job.name === jobName);
  }
  setupErrorDelegators() {
    this._daemonProcess.on("get-jobs-error", (message) => {
      throw message;
    });
    this._daemonProcess.on("job-failed", (message) => {
      throw message;
    });
  }
  clearJobs() {
    this._jobs = [];
  }
  setDaemonPath(path) {
    this._daemonPath = path;
  }
}
module.exports = Scheduler;
