# telda-coding-challenge

Implement an in-process cron scheduler that accepts a job and executes it periodically.

## Description
`node-cronelda` is a simple lightweighted (zero-dependencies) scheduler that runs scheduled jobs based on provided intervals similar to cron-jobs. The scheduler is able to handle multiple synchronous and asynchronous jobs' executions concurrently. `node-cronelda` works by spawning a child process which executes the jobs provided, without blocking the main thread. 

It simply works by importing `Scheduler` class in your main code.
```javascript
const Scheduler = require("./Scheduler");
```
Then you create an object represents the job you need to run, and add it to the `Scheduler`. Below is a simple code snippet illustrating.

```javascript
    const job = {
      name: "job 1",
      time: "1s",
      execution: () => {
        console.log("x");
      },
    };
    const scheduler = new Scheduler(); // Create an instance from Scheduler
    scheduler.addJob(job); // Add the above job to the Scheduler
    scheduler.start(); // Starts executing the job
```
If you need to stop executing the jobs, just call the following method.
```javascript
scheduler.stop()
```
<hr>

## How `node-cronelda` works
<img width="800" alt="scheduler-part1" src="https://github.com/shehabadel/telda-coding-challenge/assets/53188087/d0c500ae-5967-434f-9a9b-12b66938719c">


1. The client code initializes the `Scheduler`
      ```javascript
      const scheduler = new Scheduler();
      ```
2. The client adds the jobs' data to the client using either `addJob` or `addBulkJobs` methods.
   ```javascript
   scheduler.addJob(job); //or scheduler.addBulkJobs(jobs)
   ```
3. The client calls `start` method of the scheduler to start executing the jobs.
   ```javascript
   scheduler.start()
   ```
4. Upon calling `start` method, the scheduler emits an event called `start-scheduler` where upon emitting this event, the `Scheduler` calls an auxiliary method called `startScheduler`.
   ```javascript
    this.on("scheduler-start", () => {
      console.log(
        `SCHEDULER: ---Starting scheduler--- {${new Date().toLocaleString()}}`
      );
      this.startScheduler();
    });
   ```
5. The `startScheduler` method spawns a child process which runs the `daemon`, which is responsible for executing and stopping the jobs in the scheduler.
   ```javascript
   startScheduler() {
    if (!this._isRunning) {
      this._daemonProcess = fork(this._daemonPath);
   //...
   ```
6. Then, the `scheduler` converts the execution functions in the `jobs` added in step.2 to a string form, and sends them as a message of type `get-jobs-data` to the child process using IPC.
   ```javascript
   const jobsToSend = this._jobs.map((job) => {
        job.execution = job.execution.toString();
        return job;
      });
      this._daemonProcess.send({
        type: "get-jobs-data",
        data: jobsToSend,
      });

   ```
7. The `daemon` keeps listening for messages, and when it receives a message of type `get-jobs-data`, it converts the jobs' execution functions into its normal form and add it to its `_jobs` list.
   ```javascript
   //daemon.js
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
   ```
8. Back to the `startScheduler` method in `Scheduler.js`. After sending the data to the `daemon`, the scheduler instructs the `daemon` to start executing the jobs.
   ```javascript
   //...
   this._daemonProcess.send({
        type: "run-jobs",
      });

   this._daemonProcess.on("message", (message) => {
        if (message === "daemon-isRunning") {
          this._isRunning = true;
        }
   });
   //...
9. The `daemon` receives the `run-jobs` message and starts running the jobs using `startDaemon()` method, and sends a message to signal that the daemon is currently running to update the status of the `scheduler` to `running`
   ```javascript
   case "run-jobs":
      if (_jobs.size > 0) {
        console.log("DAEMON: -----Starting Daemon-----");
        startDaemon();
        process.send("daemon-isRunning");
      }
      break;
   ```
10. When the client wants to stops the `daemon` from running, they must call the following method in their source code
    ```javascript
      scheduler.stop()
    ```
11. `stop()` method emits an event called `scheduler-stop` which calls `stopScheduler` auxiliary method.
    ```javascript
    this.on("scheduler-stop", () => {
      console.log("SCHEDULER: ---Stopping scheduler---");
      this.stopScheduler();
    });
    ```
12. `stopScheduler` method will send a message to the `daemon` to stop running the jobs, and wait for a reply with `daemon-stopped` in order to terminate the daemon process and set the scheduler to `running = false`
   ```javascript
   //Scheduler.js
   //...
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
   ```
14. The `daemon` will receive the `stop-jobs` message and calls `stopDaemon()` method, which will clear the interval IDs of each job.
   ```javascript
   //daemon.js
   //...
   case "stop-jobs":
      console.log("DAEMON: -----Stopping Daemon-----");
      stopDaemon();
      console.log("DAEMON: -----Stopped Daemon-----");
      process.send("daemon-stopped");
   break;
   //...
   function stopDaemon() {
     Array.from(_jobs.values()).forEach((job) => {
       job.stopJob();
     });
   }
//...
   ```
15. `job.stopJob()` method will emit an event `stop-job`, which will clear the `intervalId` or `timeoutId` and set the `_intervalId` of the job to `null` value
   ```javascript
      //Job.js
      //...
       this.on("stop-job", () => {
         clearInterval(this._intervalId);
         clearTimeout(this._intervalId);
         this._intervalId = null;
       });
   ```
<hr>

## Job Class
This represents a scheduled task with a name, execution function, and time interval.

### constructor arguments
- `name`: represents unique name of the job.
- `time`: represents time interval of the job. (e.g. 1s, 30m, 1hr 25m, 2d) **Limit: ~~ 25d**
- `execution`: represents the function that runs during executing the job.
- `options?` (optional): an optional object that takes property `once` if you wanted to run the job only once (default=false).
### Example 
```javascript
  {
    name: "job 1",
    time: "5s",
    execution: () => {
      console.log("x");
    },
    options: {
      once: true,
    },
  },
```
### Allowed time intervals
In `Parser.js`, there is a function converts time expressions like `1h 10m` to a single integer to be understood by the `setTimeout` or `setInterval` methods. 
Currently these are the allowed expressions.
```
 * allowed expressions:
 * 1. "s" -> seconds
 * 2. "m" -> minutes
 * 3. "h" -> hours
 * 4. "d" -> days
 * 5. "w" -> weeks
 * 6. "M" -> months
 * 7. "y" -> years
```
You can write `1hr 10m 25s` which will be converted to an interval of `4225000`

**Note: due to nature of setInterval() and setTimeout, the maximum expression allowed is 25 days (See limitations section below)** 
<hr>

## Example usage
### Code snippet - One job runs once
```javascript
//index.js
const Scheduler = require("./Scheduler");

function main() {
  try {
    const job = {
      name: "job 1",
      time: "5s",
      execution: () => {
        console.log("x");
      },
      options: {
        once: true,
      },
    };
    const scheduler = new Scheduler();
    scheduler.addJob(job);
    scheduler.start();
  } catch (error) {
    console.error(error);
  }
}

main();

```
![image](https://github.com/shehabadel/telda-coding-challenge/assets/53188087/28f5b87c-e48b-4756-b611-c7544fbceb24)

## To be improved

1. Support cron expressions in `time`. e.g. (\* \* \* \* \* \*)
2. Support persisting the jobs metadata either on local storage or a database (MongoDB, Redis)
3. Support configuring the `Scheduler` to run automatically when server reboots (depends on number 2)
4. Add CI/CD Pipeline to run tests in pull requests.
5. Support running the `daemon` in `detached` mode, which keeps running the jobs even if the parent process is terminated.

## Limitations

1. Maximum `interval` can be added to a job is the maximum `delay` parameter accepted by `setInterval` or `setTimeout` which is
   `2147483647`ms, approximately 25 days. If you added longer `interval` than the max, it will be automatically set to the maximum interval.
2. When the `Scheduler` sends the jobs' data to the `daemon`, the `execution` function of each job is stringfied. Thus, it loses its `this`
   context. So, the `execution` function of the job must be standalone-function for now.


## Trade-offs
1. I decided to delegate running jobs to another module called “daemon” which runs in a child process whenever the Scheduler's `start()` method is called.

   Why did I go with this approach?

   - I faced a problem with clearing the timeouts of the tasks whenever I call `scheduler.stop()`, since it keeps waiting for the last task to finish its callback, then terminates.
   Unlike using a separate child process which will terminate the process directly. In addition, it will not block the main process execution.

