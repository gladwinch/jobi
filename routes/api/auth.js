const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const passport = require('passport')

const Candidate = require('../../models/Candidate')
const validUser = require('../../validation/validUser')
const { signToken } = require('../../services/AuthService')
const router = express.Router()

// @route    POST api/auth/social
// @desc     Social network authentication
// @access   Public
router.post('/social', async (req, res) => {

  if(Object.keys(validUser(req.body)).length !== 0) {
    res.status(404).json({
      success: false,
      data: validUser(req.body),
      message: 'Data is not valid'
    })
  }

  try {
    const { email, name, avatar } = req.body

    let candidate = await Candidate.findOne({ email })

    if (candidate) {
      return sendTokenResponse(candidate, 200, res)
    }
    
    candidate = await Candidate.create({ 
      name, email, 
      avatar: { url: avatar, name: '' }, 
      job_alert: { email, searchs: [] } 
    })

    sendTokenResponse(candidate, 200, res)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route    GET api/auth/linkedin
// @desc     Authenticate user with linkedin Auth & get token
// @access   Public
router.get('/linkedin',
  passport.authenticate('linkedin', {
    session: false,
  })
)

router.get('/linkedin/callback',
  passport.authenticate('linkedin', {
    session: false,
    failureRedirect: '/api/auth/failed'
  }),
  (req, res) => signToken(req, res)
)

// @route    POST api/auth/register
// @desc     Register candidate and generate token
// @access   Public
router.post(
    '/register',
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
    async (req,res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { name, email, password } = req.body
    
        try {
            let candidate = await Candidate.findOne({ email })
        
            if (candidate) {
              return res
              .status(400)
              .json({ errors: [{ msg: 'User already exists' }] })
            }
            
            candidate = await Candidate.create({ name, email, password, job_alert: { email } })
            sendTokenResponse(candidate, 200, res)
        } catch (err) {
            console.error(err)
            res.status(500).send('Server error')
        } 
    }
)

// @route    POST api/auth/login
// @desc     Login candidate and generate token
// @access   Public
router.post(
    '/login',
    [
        check('email', 'Email is required')
          .not()
          .isEmpty(),
        check(
          'password',
          'Password is required'
        )
    ],
    async (req,res) => {
        console.log("route is working...", req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body
    
        try {
            let candidate = await Candidate.findOne({ email }).select('+password')
            console.log("candidate: ",candidate)
        
            if (!candidate) {
                return res
                .status(400)
                .json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            const isMatch = await bcrypt.compare(password, candidate.password)

            if (!isMatch) {
                return res
                  .status(400)
                  .json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            sendTokenResponse(candidate, 200, res)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        } 
    }
)

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken()
  
    const options = {
      expires: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    }
  
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({ token })
}

module.exports = router