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
  }

  /**
   * @description executes the Job and returns the result
   * and emits an event when job finishes or fails.
   */
  execute() {
    let exec;
    try {
      exec = this._execution();
    } catch (error) {
      this.emit("job failed", error);
    }
    if (exec instanceof Promise) {
      return exec
        .then((result) => {
          this.emit("job finished");
          return result;
        })
        .catch((error) => {
          this.emit("job failed", error);
          throw error;
        });
    } else {
      this.emit("job finished");
      return exec;
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

  clearInterval() {
    clearInterval(this._intervalId);
  }
}
module.exports = Job;
