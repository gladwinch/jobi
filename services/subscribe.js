const mongoose = require('mongoose')
const Jobs = require("../models/Jobs")


const subscribeUser = async (req, res) => {
    console.log("PACKAGE: ", req.body)

    let interval
    if (req.body.package === 'monthly') {
        interval = 31 
    } else {
      interval = 7
    }


    // res.send("subscibed")
    // return

    let days = new Date()
    let timestamp = days.setDate(days.getDate() + interval)

    try {
        let profile = await Jobs.findOne({
            userID: req.user.id
        })

        if (!profile) {
            return res.status(400).json({
                message: "No User found"
            })
        }

        profile.settings.subscription.expire = timestamp
        profile.settings.subscription.status = true
        await profile.save()

        res.status(200).json({
            expire: timestamp,
            status: true
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: "Server error"
        })
    }
}

module.exports = subscribeUser