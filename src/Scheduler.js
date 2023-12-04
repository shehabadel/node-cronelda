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
      console.log(
        `SCHEDULER: ---Starting scheduler--- {${new Date().toLocaleString()}}`
      );
      this.startScheduler();
    });
    this.on("task-add-failed", (error) => {
      throw error;
    });
  }
  /**
   * @description Adds a job to the scheduler, if the scheduler
   * already running, it will send to the `daemon` to the job's data
   * and instruct the `daemon` to run the job.
   * @param {Object} jobObj
   */
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
      this.emit("task-add-failed", error);
    }
  }
  /**
   * @description Checks if the scheduler is not currently running
   * then spawns a child process of `daemon.js`. After creating the child process
   * we convert the jobs' execution method to a stringified format.
   * Then, send the `jobs` data to the `daemon` process.
   * In addition it sends a message to the `daemon` process to start running the jobs sent.
   */
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
      this.startDaemon();
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
  /**
   * @description Sends an event to start the scheduler.
   */
  start() {
    this.emit("scheduler-start");
  }
  /**
   * @description Sends an event to stop the scheduler.
   */
  stop() {
    this.emit("scheduler-stop");
  }
  /**
   * @description Returns if the scheduler is running or not.
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }
  /**
   * @description Returns number of jobs in the scheduler.
   * @returns {number}
   */
  getJobsLength() {
    return this._jobs.size;
  }

  /**
   * @description Sends a message to the `daemon` to stop running the jobs
   * and clear their intervals. In addition to wait for `daemon` response.
   * Then terminate the `daemon` process.
   */
  stopScheduler() {
    if (this.isRunning()) {
      this._daemonProcess.send({
        type: "stop-jobs",
      });
      this._daemonProcess.on("message", (message) => {
        if (message === "daemon-stopped") {
          this._daemonProcess.kill();
          this._isRunning = false;
          console.log(
            `SCHEDULER: ---Stopped scheduler---  {${new Date().toLocaleString()}}`
          );
        }
      });
    }
  }
  /**
   * @description Gets list of jobs in the scheduler.
   * @returns {Object[]}
   */
  getJobs() {
    return this._jobs;
  }
  /**
   * @description Checks if a job already exists in the scheduler.
   * @param {string} jobName
   * @returns {boolean}
   */
  jobExists(jobName) {
    return this._jobs.some((job) => job.name === jobName);
  }
  /**
   * @description Checks if there are any error messages came
   * from the `daemon` process and throws an error.
   */
  setupErrorDelegators() {
    this._daemonProcess.on("get-jobs-error", (message) => {
      throw message;
    });
    this._daemonProcess.on("job-failed", (message) => {
      throw message;
    });
  }
  /**
   * @description Clears all jobs in the scheduler
   */
  clearJobs() {
    this._jobs = [];
  }
  /**
   * @description Sets the directory path of the `daemon.js` file.
   * Used for testing purposes.
   * @param {string} path
   */
  setDaemonPath(path) {
    this._daemonPath = path;
  }
  /**
   * @description Adds multiple jobs to the scheduler.
   * @param {Object[]} jobs
   */
  addBulkJobs(jobs) {
    try {
      jobs.forEach((job) => {
        this.addJob(job);
      });
    } catch (error) {
      this.emit("task-add-failed", error);
    }
  }
  /**
   * @description Sends a message to the `daemon` process
   * to start running the jobs.
   */
  startDaemon() {
    this._daemonProcess.send({
      type: "run-jobs",
    });
  }
}
module.exports = Scheduler;
