const express = require('express')
const router = express.Router()
const skillScore = require('../../utils/skillScore')
const validator = require("email-validator")

const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const getIndeed = require('../../source/indeed')
const indeedNotify = require('../../source/indeed/notifier')




// -------------===========Search Engine==================-------------

// @route    POST api/profile/search
// @desc     Get search result
// @access   Public

router.get('/search', async (req, res) => {
  console.log("Route got hit:", req.query)

  if (Object.keys(req.query).length != 3) {
    return res.status(400).json({
      errors: "Params are not vaild"
    })
  }

  try {

    let value = await Promise.all([getIndeed(req.query)])
    console.log("-----------------------===============------------------------")

    let requestedData = value[0].map(result => {
      let { title, description, more_description } = result

      let stringData = title+' '+description+' '+more_description
      return {
        ...result,
        skill: skillScore(stringData.toLowerCase())
      }
    })
    
    res.status(200).json(requestedData)
    console.log("job search complete")
  } catch(err) {
    console.log("ERROR: ", err)

    return res.status(400).json({
      errors: "Server error"
    })
  }

})

// single job real time
router.get('/single-job', (req, res) => {
  console.log("single Data: ", req.query)
  

  indeedNotify(req.query, true)
    .then(result => {
      let { title, description, more_description } = result
      let stringData = title+' '+description+' '+more_description

      result = {
        ...result,
        skill: skillScore(stringData.toLowerCase())
      }

      console.log("Result: __",result)
      res.json(result)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        msg: 'Server Error'
      })
    }) 
})

router.get('/browser', (req, res) => {
  console.log("route is working...", req.query.id)
  res.json({
    id: req.query.id,
    name: req.query.name,
    success: true
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
