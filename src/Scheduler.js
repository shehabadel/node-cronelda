const EventEmitter = require("events");
const Job = require("./Job");

class Scheduler extends EventEmitter {
  constructor() {
    super();
    this._jobs = new Map();
    this._isRunning = false;
    this.on("scheduler-start", () => {
      console.log("Started scheduler");
      for (let [key, val] of this._jobs.entries()) {
        console.log(key, val);
      }
    });
    this.on("task-execute", (jobName) => {
      console.log(jobName);
    });
  }
  addJob(jobObj) {
    let job;
    try {
      job = new Job(
        jobObj.name,
        jobObj.time,
        jobObj.execution,
        jobObj?.options
      );
    } catch (error) {
      this.emit("task-add-failed");
      throw error;
    }

    try {
      if (this._jobs.has(job.getName())) {
        throw new Error(`${job.getName()} already exists!`);
      }
      this._jobs.set(job.getName(), job);
      if (this._isRunning) {
        this.emit("task-execute", job.getName());
      }
    } catch (error) {
      console.error(`Couldn't add ${job.getName()} as it is already exists`);
      this.emit("task-add-failed");
      throw error;
    }
  }
  start() {
    this._isRunning = true;
    this.emit("scheduler-start");
  }
  stop() {
    this._isRunning = false;
    this.emit("scheduler-stop");
  }
  isRunning() {
    return this._isRunning;
  }
  getJobsLength() {
    return this._jobs.size;
  }
}
module.exports = Scheduler;
