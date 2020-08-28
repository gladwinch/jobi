const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
const Profile = require('../models/Profile')
const Jobs = require('../models/Jobs')

async function saveUserDB(userData) {
  console.log("userData: ", userData)
  let newUser = await new User(userData).save()

  let profile = new Profile({ user: newUser.id })

  let job = new Jobs({
    userID: newUser.id,
    settings: {
      emails: [userData.email],
      subscription: {
        expire: 111,
        status: false
      }
    }
  })

  await profile.save()
  await job.save()
    

  return newUser
}


module.exports = passport => {

    //google setup
    passport.use(new GoogleStrategy({
        clientID: require('../config/keys').Google_Id,
        clientSecret: require('../config/keys').Google_secret,
      callbackURL: "https://jobi.ie/api/auth/google/callback"
    },
      async function (accessToken, refreshToken, profile, done) {
        
        let userData = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        }

        User.findOne({googleId: userData.googleId})
          .then(existingUser => {
             if (existingUser) {
               console.log("user exist")
                return done(null, existingUser)
             } else {
               User.findOne({email: userData.email})
                 .then(async (user) => {
                    if(!user) {
                      console.log("creating new user")
                      done(null, await saveUserDB(userData))
                    } else {
                      done(null, user)
                    }
                 })

             }
          })
      }
    ))

    passport.use(new GitHubStrategy({
        clientID: require('../config/keys').Github_id,
        clientSecret: require('../config/keys').Github_secret,
        callbackURL: "https://jobi.ie/api/auth/github/callback",
        scope: ['user:email', 'user:displayName']
      },
      function (accessToken, refreshToken, profile, done) {
                
        let userData = {
          githubId: profile.id,
          name: profile.username,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        }

        User.findOne({githubId: userData.githubId})
          .then(existingUser => {
             if (existingUser) {
               console.log("user exist")
                return done(null, existingUser)
             } else {
               User.findOne({email: userData.email})
                 .then(async (user) => {
                    if(!user) {
                      done(null, await saveUserDB(userData))
                    } else {
                      done(null, user)
                    }
                 })

             }
          })
      }
    ));


    //facebook setup
    passport.use(new FacebookStrategy({
        clientID: require('../config/keys').Facebook_Id,
        clientSecret: require('../config/keys').Facebook_secret,
        callbackURL: "https://jobi.ie/api/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'emails']
    },
      function(accessToken, refreshToken, profile, done) {

        let userData = {
          facebookId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        }
        
        User.findOne({facebookId: userData.facebookId})
          .then(existingUser => {
             if (existingUser) {
               console.log("user exist")
                return done(null, existingUser)
             } else {
               User.findOne({email: userData.email})
                 .then(async (user) => {
                    if(!user) {
                      done(null, await saveUserDB(userData))
                    } else {
                      done(null, user)
                    }
                 })

             }
          })
      }
    ))
    

    //linkedin setup
    passport.use(new LinkedInStrategy({
      clientID: require('../config/keys').Linkedin_Id,
      clientSecret: require('../config/keys').Linkedin_secret,
      callbackURL: "https://jobi.ie/api/auth/linkedin/callback",
      scope: ["r_liteprofile", "r_emailaddress"],
    }, function (accessToken, refreshToken, profile, done) {

      process.nextTick(function () {
        let userData = {
          linkedinId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        }

        User.findOne({linkedinId: userData.linkedinId})
          .then(existingUser => {
             if (existingUser) {
               console.log("user exist")
                return done(null, existingUser)
             } else {
               User.findOne({email: userData.email})
                 .then(async (user) => {
                    if(!user) {
                      done(null, await saveUserDB(userData))
                    } else {
                      done(null, user)
                    }
                 })

             }
          })
        })
    }))
}
