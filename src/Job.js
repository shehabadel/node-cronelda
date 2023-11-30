const EventEmitter = require("events");

class Job extends EventEmitter {
  constructor(name, time, execution, options = {}) {
    super();
    if (typeof execution !== "function") {
      throw "execution parameter must be a function!";
    }
    this._name = name;
    this._time = time;
    this._execution = execution;
    this._once = options.once !== undefined ? options.once : false;
  }

  /**
   * @description executes the Job and returns the result
   * and emits an event when task finishes or fails.
   */
  execute() {
    let exec;
    try {
      exec = this._execution();
    } catch (error) {
      this.emit("task failed", error);
    }
    if (exec instanceof Promise) {
      return exec
        .then((result) => {
          this.emit("task finished");
          return result;
        })
        .catch((error) => {
          this.emit("task failed", error);
          throw error;
        });
    } else {
      this.emit("task finished");
      return exec;
    }
  }
}
module.exports = Job;
