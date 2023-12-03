const EventEmitter = require("events");
const parseTimeToInt = require("./Parser").parseTimeToInt;
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
    this._interval = parseTimeToInt(time);
    this._intervalId = null;

    this.on("start-execution", () => {
      console.log(
        `Job {${this._name}} has started executing with interval: ${this._interval}`
      );
    });
    this.on("job-failed", (error) => {
      console.log(`Job {${this._name}} has failed with the following error`);
      console.error(error);
    });
    this.on("stop-job", () => {
      clearInterval(this._intervalId);
      clearTimeout(this._intervalId);
      this._intervalId = null;
    });
  }

  /**
   * @description executes the Job and returns the result
   * and emits an event when job finishes or fails.
   */
  execute() {
    this.emit("start-execution");
    let exec;
    try {
      if (!this.getOnce()) {
        let intervalId = setInterval(() => {
          exec = this._execution();
        }, this._interval);
        this.setIntervalId(intervalId);
      } else {
        let timeoutId = setTimeout(() => {
          exec = this._execution();
        }, 0);
        this.setIntervalId(timeoutId);
      }
    } catch (error) {
      this.emit("job failed", error);
    }
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
