const express = require('express')
const Candidate = require('../../models/Candidate')

const auth = require('../../middleware/auth')
const subscribeUser = require('../../services/subscribe')
const router = express.Router()

let stripeSecretKey = 'sk_test_51DpVxgCXYXHHnswHauHxIwg6wx1Ybs5tveAo1pffJs97vtQuqdyBIZQfacA3Bn1AXiBodW5l5SuQRgO8rCRSJral00cV1Xnj0y'
const stripe = require('stripe')(stripeSecretKey)

const package = {
    monthly: 'price_1Hm7jTCXYXHHnswHPPsG9rfj',
    weekly: 'price_1Hm7lfCXYXHHnswHg6iCnYVJ'
}

// @route    POST api/jobs/add-notes
// @desc     Add to notes to selected notes
// @access   Private
router.post('/create-customer', auth, async (req, res) => {
    console.log("checking body: ",req.body)

    let candidate = await Candidate.findById(req.candidate.id)
    let package = req.body.package

    if(package !== 'monthly' && package !== 'weekly') {
        return res.status(404).json({
            success: false,
            message: "No package selected"
        })
    }

    if(!candidate) {
        return res.status(404).json({
            success: false,
            message: "User not found!"
        })
    }

    if(candidate.stripeCustomerId) {
        console.log("customer already exist")
        candidate.package = package
        await candidate.save()
        return res.send(candidate)
    }

    const customer = await stripe.customers.create({
      email: candidate.email,
      name: candidate.name
    })

    candidate.stripeCustomerId = customer.id
    candidate.package = package
    await candidate.save()
  
    res.send(candidate)
})

router.post('/unsubscribe', auth, async(req,res) => {
    console.log('unsubscribe route is working...')
    res.status(200).json("User is unsubscibe")
})


module.exports = router