# telda-coding-challenge

Implement an in-process cron scheduler that accepts a job and executes it periodically.

## To be improved

1. Support cron expressions in `time`. e.g. (\* \* \* \* \* \*)
2. Support persisting the jobs metadata either on local storage or a database (MongoDB, Redis)
3. Support configuring the `Scheduler` to run automatically when server reboots (depends on number 2)
4. Add CI/CD Pipeline to run tests in pull requests.

## Limitations

1. Maximum `interval` can be added to a job is the maximum `delay` parameter accepted by `setInterval` or `setTimeout` which is
   `2147483647`ms, approximately 25 days.
