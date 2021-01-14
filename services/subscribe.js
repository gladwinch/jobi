const subscribeUser = async (res, candidate, package) => {

    let interval
    package === 'monthly' ? interval = 31 : interval = 7

    let days = new Date()
    let timestamp = days.setDate(days.getDate() + interval)

    try {
        console.log("candidate: ", candidate)

        candidate.subscription.user = true
        candidate.subscription.duration = timestamp
        await candidate.save()

        res.status(200).json({
            data: candidate,
            success: true,
            message: "Request went successful!"
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: "Server error"
        })
    }
}

module.exports = subscribeUser