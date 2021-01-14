const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const Candidate = require('../models/Candidate')

async function saveUserDB(userData) {
  let { email, name, avatar } = userData

  let candidate = await Candidate.create({ 
    name, 
    email, 
    avatar: { url: avatar, name: '' }, 
    job_alert: { email, searchs: [] } 
  })

  return candidate
}


module.exports = passport => {

  //linkedin setup
  passport.use(new LinkedInStrategy({
    clientID: require('../config/keys').Linkedin_Id,
    clientSecret: require('../config/keys').Linkedin_secret,
    callbackURL: "http://localhost:5000/api/auth/linkedin/callback",
    scope: ["r_liteprofile", "r_emailaddress"],
  }, function (accessToken, refreshToken, profile, done) {

    process.nextTick(async function () {
      let userData = {
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      }

      let candidate = await Candidate.findOne({ email: userData.email })
      if (candidate) return done(null, candidate)
      
      done(null, await saveUserDB(userData))
    })
  }))
}
