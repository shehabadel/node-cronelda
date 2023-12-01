const Job = require("./Job");
const Scheduler = require("./Scheduler");
const job = new Job("job 1", 1000, () => {
    console.log('hello')
});
const scheduler = new Scheduler()
scheduler.addJob(job)
scheduler.addJob(job)
scheduler.start();
const result = job.execute()
