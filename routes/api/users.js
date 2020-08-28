const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const auth = require('../../middleware/auth') 
const { check, validationResult } = require('express-validator')
const keys = require('../../config/keys');

const User = require('../../models/User')
const Jobs = require('../../models/Jobs')
const Profile = require('../../models/Profile')

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 5 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body

    try {
      let user = await User.findOne({ email })

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })
      }
      

      user = new User({
        name,
        email,
        avatar: '',
        password
      })

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      await user.save()

      let profile = new Profile({
        user: user.id
      })

      let job = new Jobs({
        userID: user.id,
        settings: {
          emails: [user.email],
          subscription: {
            expire: 111,
            status: false
          }
        }
      })

      await profile.save()
      await job.save()

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        keys.secretOrKey,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      );
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// auto complete api
router.post('/place', (req, res) => {
  let key = keys.placeKey

  let uri = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.body.data}&types=(cities)&types=(country)&key=${key}`
  axios.get(uri)
    .then(result => {

     if(result.data.status == 'OK') {
       let autoData = result.data.predictions.map(prediction => {
         return prediction.description
       })
   
       res.json(autoData)
     }
    })
    .catch(err => {
      res.send('error')
      console.log("Error: ", err)
    })
})

router.post('/set-subscribe', auth, async (req, res) => {

  
  try {
    let result = await Jobs.findOne({ userID: req.user.id })
    console.log("RESULT: ", result)

    if (!result) {
      console.log("ERR: ", result)
      throw new Error({'msg':'NO USER FOUND'}); 

    }

    result.settings.subscription.status = !result.settings.subscription.status
    await result.save()
    console.log("result: ", result)

    res.status(200).json(result.settings.subscription)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
