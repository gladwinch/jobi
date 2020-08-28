const express = require('express')
const router = express.Router()
const validator = require("email-validator")

const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const mongoose = require('mongoose')
const Profile = require('../../models/Profile')
const Jobs = require('../../models/Jobs')
const User = require('../../models/User')
const getIndeed = require('../../source/indeed')
const indeedNotify = require('../../source/indeed/notifier')

// @route    GET api/profile/data
// @desc     Get current users profile data
// @access   Private
router.get('/get-details', auth, async (req, res) => {


  try {
    
    const user = await User.findById(req.user.id)
    const jobs = await Jobs.findOne({ userID: req.user.id})
    console.log("JOBS: ", jobs)

    if (!user) {
      return res.status(400).json({
        msg: 'No user found!'
      })
    }

    let data = {
      user,
      jobData: jobs || []
    }

    console.log("User Data: ", data)
    
    res.json(data)

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})


// @route    GET api/profile/data
// @desc     Get current users profile data
// @access   Private
router.post('/add-jobs', auth, async (req, res) => {
  console.log("Client: ", req.body)
  

  try {
    const job = await Jobs.findOne({ userID: req.user.id})
    
    if(!job) {
      let jobData = new Jobs({
        userID: req.user.id,
        ...req.body
      })

      await jobData.save()

      res.json(jobData)
    } else {

      job.jobsInfo = req.body.jobsInfo
      job.settings = req.body.settings

      await job.save()
      res.json(job)
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

// @route    GET api/profile/update-alertinfo
// @desc     Update user data
// @access   Private
router.post('/update-user', auth,
  [
    check('name', 'Name is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const { name, location, shortBio } = req.body

    try {
      let user = await User.findById(req.user.id)

      if (!user) {
        return res.status(400).json({
          message: "No User found"
        })
      }

      user.name = name
      user.location = location
      user.shortBio = shortBio

      await user.save()

      res.status(200).json(user)
    } catch (error) {
      console.log(error)

      res.status(400).json({
        message: "Server Error"
      })
    }
})


// @route    GET api/profile/post-data
// @desc     Add Profile data data
// @access   Private
router.post('/add-details', auth, async (req, res) => {
  
  if (Object.keys(req.body).length != 7) {
      return res.status(400).json({
        errors: "Something went wrong"
      })
  }

  try {

      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        { new: true, upsert: true }
      )
      
      res.json(profile)

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
    }
})




// -------------===========Search Engine==================-------------

// @route    POST api/profile/search
// @desc     Get search result
// @access   Public

router.post('/search', async (req, res) => {
  console.log("Route got hit:", req.body)

  if (Object.keys(req.body).length != 3) {
    return res.status(400).json({
      errors: "Params are not vaild"
    })
  }

  try {

    let value = await Promise.all([getIndeed(req.body)])
    console.log("---------------------------===============------------------------")
    

    res.status(200).json(value[0])
    console.log("job search complete")
  } catch(err) {
    console.log("ERROR: ", err)

    return res.status(400).json({
      errors: "Server error"
    })
  }

})

// single job real time
router.post('/single-job', (req, res) => {
  console.log("Data: ", req.body)

  indeedNotify(req.body, true)
    .then(result => {
      console.log("Result: __",result)
      res.json(result)
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({
        msg: 'Server Error'
      })
    }) 
})


// new update routes 
router.post('/update-details', auth, async (req, res) => {
  console.log('route is running!')
    if (Object.keys(req.body).length != 3) {
      console.log("object count err!")
      return res.status(400).json({
        errors: "Something went wrong"
      })
    }
    
    const { name, email, subscription } = req.body

    

    try {
      let user = await User.findById(req.user.id)

      if (!user) {
        return res.status(400).json({
          message: "No User found"
        })
      }

      if (!validator.validate(email)) {
        return res.status(400).json({
          message: "Email is not Valid"
        })
      }

      user.name = name
      user.emailId = email
      user.subscription = subscription

      await user.save()

      res.status(200).json(user)
    } catch (error) {
      console.log(error)

      res.status(400).json({
        message: "Server Error"
      })
    }
})


module.exports = router;
