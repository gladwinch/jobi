const jwt = require('jsonwebtoken')
const secretOrKey = require('../config/keys').secretOrKey

// Issue Token
exports.signToken = (req, res) => {   
    const payload = {
        id: req.user._id
    }

    jwt.sign(
        payload,
        secretOrKey, {
            expiresIn: 360000
        },
        (err, token) => {
            if (err) throw err
     
            console.log("successful login now redirecting...")
            res
                .status(200)
                .redirect(`https://thawing-savannah-77482.herokuapp.com/redirect/${token}`)
        }
    )
}