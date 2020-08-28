const CronJob = require('cron').CronJob;
const Profile = require('../models/Profile')
const indeedNotify = require('../source/indeed/notifier')
const sendEmail = require('./sendEmail')


let premium = new CronJob('*/30 * * * *', async function () {

console.log("cron staring")
    let results = await Jobs.find({
        'settings.subscription.status': true,
        'settings.active': true,
        'settings.adminActive': true,
        'settings.subscription.expire': { $gt: Date.now() },
        "jobsInfo.0": { "$exists": true }
    })

    console.log("results: ", results)

    for (let i = 0; i < results.length; i++) {
        let randomIndex = Math.floor(Math.random() * results[i].jobsInfo.length) || 0
        let emailIndex = Math.floor(Math.random() * results[i].settings.emails.length)

        let query = {
            title: results[i].jobsInfo[randomIndex].title,
            location: results[i].jobsInfo[randomIndex].location,
            page: 1
        }

        indeedNotify(query)
            .then(result => {

                // send email
                sendEmail(results[i].settings.emails[emailIndex], result)

                // send telegram message if active

            })
            .catch(err => {
                console.log("Something went wrong")
            })

    }
})


let freetier = new CronJob('0 0 */1 * *', async function () {
    let results = await Jobs.find({
        'settings.active': true,
        "jobsInfo.0": { "$exists": true }
    })

    for (let i = 0; i < results.length; i++) {
        let randomIndex = Math.floor(Math.random() * results[i].jobsInfo.length) || 0
        let emailIndex = Math.floor(Math.random() * results[i].settings.emails.length)

        let query = {
            title: results[i].jobsInfo[randomIndex].title,
            location: results[i].jobsInfo[randomIndex].location,
            page: 1
        }

        indeedNotify(query)
            .then(result => {

                // send email if active
                sendEmail(results[i].settings.emails[emailIndex], result)

                // send telegram message if active

            })
            .catch(err => {
                console.log("Something went wrong")
            })

    }
})

module.exports = { premium, freetier }