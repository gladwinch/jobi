const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const subscribeUser = require('../../services/subscribe')

router.post('/', auth, async (req, res) => {
    //payment logic
    console.log("data: ", req.body)
    console.log("payment done. starting operation...")
    // when payment is success call subscribeUser
    subscribeUser(req, res) 
})

// --------------------------------------------------------------------

// Stripe Payment Integration

// env variables:
const stripeSecretKey = 'sk_test_VJriXelBwM6E6hBDca9cNHGV';
const monthlyPriceID = 'price_1Gx6byEluQXhZEvLZyeUE46q';
const weeklyPriceID =  'price_1Gx6b1EluQXhZEvLqm1TJeBw';
const success_url =  'http://localhost:8080/api/payment/stripe-success?session_id={CHECKOUT_SESSION_ID}';
const cancel_url =  'http://localhost:8080/api/payment/stripe-cancel';

// requirements:
const stripe = require('stripe')(stripeSecretKey, {apiVersion: ''});
const User = require('../../models/User');

// helper functions:
    // get user:
const authUser = async () => {
    let authenticatedUserEmail = 'ahmedmarzouk266@gmail.com' ;
    return await User.findOne({email: authenticatedUserEmail});
};

// Stripe routes:
router.post('/get-stripe-session', async (req, res) => {

    // choose monthly|weekly subscription:

    let sub_frq = req.body.subscription_frequency ;
    let priceID = monthlyPriceID;
    if(sub_frq === 'weekly'){
        priceID = weeklyPriceID ;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: priceID,
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: success_url,
        cancel_url: cancel_url,
    });

    res.send(session);
});
router.get('/stripe-success', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    let user = await authUser() ;

    user.stripeCustomerID = subscription.customer;
    user.stripeSubscriptionID = subscription.id;
    user.save();

    res.send('Payment was made Successfully - return the success view ! :) ');
});
router.get('/stripe-cancel', (req, res) => {
    res.send('payment was canceled! - return the cancel view :( ');
});

// TODO: setup webhocks to make sure the payment was accepted.
// --------------------------------------------------------------------

// PayPal Payment Integration

const axios = require('axios');

// env vars:
const paypal_client_id = 'Ab77O0MIVfOsvH1EQnthFL7u1XUnZUPAqxSJPS04SOgvcJQ2DuQO2LdFQO6WOeo14pxUy5pMq4QnOmBF';
const paypalSecretKey = 'EI5zSw_yVH0_LbAfEIb6Qnwd8GgtTIVuJzDiNoQiFlqMdgXZWyVZlOFx3dQknF65vxosywa6KT4NsYhM';
const product_id_weekly  = 'PROD-3BH33991P5545344T';
const product_id_monthly = 'PROD-2K69152897139264A';
const plan_id_weekly     = 'P-6UC79070M4408410GL3ZIK4A';
const plan_id_monthly    = 'P-21E869185F8264426L3ZILBY';
const paypal_base_url    = 'https://api.sandbox.paypal.com/v1/';



// routes:

router.post('/set-paypal-sub', async (req, res) => {

    let sub_frq = req.body.subscription_frequency ;
    let planID = plan_id_monthly;
    if(sub_frq === 'weekly'){
        planID = plan_id_weekly ;
    }

    let data = JSON.stringify({
        "plan_id": planID
    });

    let config = {
        method: 'post',
        url: paypal_base_url + 'billing/subscriptions ',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(paypal_client_id + ':' + paypalSecretKey).toString('base64'),
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
        .then(function (response) {
            let approvalURL = response.data.links[0].href ; //  can be checked: links[0].rel === 'approve';
            res.send({approvalURL});
        })
        .catch(function (error) {
            console.log(error);
        });
});

router.get('/paypal-success', async (req, res) => {
    console.log('Payment success...');
    console.log(req.body);
});

router.get('/paypal-cancel', async (req, res) => {
    console.log('Payment canceled...');
    console.log(req.body);
});

// TODO: setup webhocks to make sure the payment was accepted.





module.exports = router;
