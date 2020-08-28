const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const secretOrKey = require('../../config/keys').secretOrKey
const { check, validationResult } = require('express-validator')
const passport = require('passport')
const authService = require('../../services/AuthService')

const User = require('../../models/User')


// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    POST api/auth
// @desc     Authenticate user & get token (login)
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    

    const { email, password } = req.body

    try {
      let user = await User.findOne({ email })

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        secretOrKey,
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).json({
        errors: [{
          msg: 'Server Error'
        }]
      })
    }
  }
)


// Authentication Strateries 

// @route    GET api/auth/google
// @desc     Authenticate user with Google Auth & get token
// @access   Public
router.get('/google', 
  passport.authenticate('google', {
    session: false,
    scope: ["profile", "email"],
    accessType: "offline",
    approvalPrompt: "force"
  })
)

router.get('/google/callback', 
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/failed'
  }),
  (req, res) => {
    authService.signToken(req, res)
  }
)

// @route    GET api/auth/google
// @desc     Authenticate user with github Auth & get token
// @access   Public
router.get('/github',
  passport.authenticate('github', {
    session: false,
    scope: ['user:email'],
    accessType: "offline",
    approvalPrompt: "force"
  })
)

router.get('/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/api/auth/failed'
  }),
  (req, res) => {
    authService.signToken(req, res)
  }
)

// @route    GET api/auth/google
// @desc     Authenticate user with Google Auth & get token
// @access   Public
router.get('/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope : ['email'] 
  })
)

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/api/auth/failed'
  }),
  (req, res) => {
    authService.signToken(req, res)
  }
)


// @route    GET api/auth/google
// @desc     Authenticate user with Google Auth & get token
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
  (req, res) => {
    authService.signToken(req, res)
  }
)

//Failed route
router.get('/failed', (req, res) => {
  res.send("You are failed to Login")
})

module.exports = router
