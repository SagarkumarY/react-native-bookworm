import cron from 'cron';
import https from 'http';


const job = new cron.CronJob("*/14 * * * *", function () {
    https.get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) console.log("GET request sent successfully")
            else console.log("GET request faild", res.statusCode)
    })
    .on("error", (e) => console.error("Error while sending request", e))
});

export default job;


// CRON JOB EXPLANATION

// Cron jobs are scheduled tasks  that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes


// How to define a "Scheduled"?
//You define a schedule using a  cron expression, which consists of 5 fields representing


//! MINUTE, HOUR, DAY OF MONTH,  MONTH, DAY OF THE WEEK