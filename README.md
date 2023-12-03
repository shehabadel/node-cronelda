# telda-coding-challenge

Implement an in-process cron scheduler that accepts a job and executes it periodically.

## To be improved

1. Support cron expressions in `time`. e.g. (\* \* \* \* \* \*)
2. Support persisting the jobs metadata either on local storage or a database (MongoDB, Redis)
3. Support configuring the `Scheduler` to run automatically when server reboots (depends on number 2)
4. Add CI/CD Pipeline to run tests in pull requests.

## Limitations

1. Maximum `interval` can be added to a job is the maximum `delay` parameter accepted by `setInterval` or `setTimeout` which is
   `2147483647`ms, approximately 25 days. If you added longer `interval` than the max, it will be automatically set to the maximum interval.
2. When the `Scheduler` sends the jobs' data to the `daemon`, the `execution` function of each job is stringfied. Thus, it loses its `this`
   context. So, the `execution` function of the job must be standalone-function for now.


## Trade-offs
1. I decided to delegate running jobs to another module called “daemon” which runs in a child process whenever the API’s start() method is called.

Why did I go with this approach?

- I faced a problem with clearing the timeouts of the tasks whenever I call scheduler.stop(), since it keeps waiting for the last task to its finish execution, then terminates.
Unlike using a separate child process which will terminate the execution directly. In addition, it will not block the main process execution.
