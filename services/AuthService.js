const jwt = require('jsonwebtoken')
const secretOrKey = require('../config/keys').secretOrKey

// Issue Token
exports.signToken = (req, res) => {
    console.log("req data: ",req.user.id)
    const payload = {
        user: {
            id: req.user.id
        }
    }

    jwt.sign(
        payload,
        secretOrKey, {
            expiresIn: 360000
        },
        (err, token) => {
            if (err) throw err

            let uri = ''
            if (process.env.NODE_ENV === 'production') {
                uri = `/redirect/${token}`
            } else {
                uri = `http://localhost:5000/redirect/${token}`
            }

           
            res.redirect(uri)
                       
        }
    )
}