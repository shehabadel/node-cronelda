const EventEmitter = require("events");
const parseTimeToInt = require("./Parser").parseTimeToInt;
const MAX_TIME_INTERVAL = 2147483647;
class Job extends EventEmitter {
  constructor(name, time, execution, options = {}) {
    super();
    if (typeof execution !== "function") {
      throw new Error("execution parameter must be a function!");
    }
    this._name = name;
    this._time = time;
    this._execution = execution;
    this._once = options.once !== undefined ? options.once : false;
    this._interval = Math.min(parseTimeToInt(time), MAX_TIME_INTERVAL);
    this._intervalId = null;
    this._isExecuting = false;
    this.on("start-running", () => {
      console.log(
        `[${new Date().toLocaleString()}]: Job {${
          this._name
        }} started running with interval: ${this._interval}`
      );
    });
    this.on("job-failed", (error) => {
      console.log(
        `[${new Date().toLocaleString()}]: Job {${
          this._name
        }} has failed with the following error`
      );
      throw error;
    });
    this.on("stop-job", () => {
      clearInterval(this._intervalId);
      clearTimeout(this._intervalId);
      this._intervalId = null;
    });
    this.on("start-executing", (intervalId) => {
      console.log(
        `[${new Date().toLocaleString()}] Job {${this.getName()}}: started executing `
      );
      this._isExecuting = true;
    });
    this.on("finished-executing", () => {
      console.log(
        `[${new Date().toLocaleString()}] Job {${this.getName()}}: finished executing `
      );
      this._isExecuting = false;
    });
  }

  /**
   * @description executes the Job and returns the result
   * and emits an event when job finishes or fails.
   */
  execute() {
    this.emit("start-running");
    let exec;
    try {
      if (!this.getOnce()) {
        let intervalId = setInterval(() => {
          this.emit("start-executing", intervalId);
          exec = this._execution();
          if (exec instanceof Promise) {
            exec
              .then(() => {
                this.emit("finished-executing");
              })
              .catch((error) => {
                throw error;
              });
          } else {
            this.emit("finished-executing");
          }
        }, this._interval);
        this.setIntervalId(intervalId);
      } else {
        this._executeOnce(exec);
      }
    } catch (error) {
      this.emit("job failed", error);
    }
  }
  /**
   * @description Auxiliary method for running a single-run job
   */
  _executeOnce(exec) {
    let timeoutId = setTimeout(() => {
      this.emit("start-executing");
      exec = this._execution();
      if (exec instanceof Promise) {
        exec
          .then(() => {
            this.emit("finished-executing");
          })
          .catch((error) => {
            throw error;
          });
      } else {
        this.emit("finished-executing");
      }
    }, this._interval);
    this.setIntervalId(timeoutId);
  }
  getName() {
    return this._name;
  }
  getInterval() {
    return this._interval;
  }
  getOnce() {
    return this._once;
  }
  getIntervalId() {
    return this._intervalId;
  }

  setIntervalId(intervalId) {
    this._intervalId = intervalId;
  }

  stopJob() {
    this.emit("stop-job");
  }
}
module.exports = Job;
