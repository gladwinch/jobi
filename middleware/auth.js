const jwt = require('jsonwebtoken');
const secretOrKey = require('../config/keys').secretOrKey

module.exports = function(req, res, next) {
  // Get token from header
 
  const token = req.header('x-auth-token')
  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'authorization denied' })
  }

  // Verify token
  try {
    jwt.verify(token, secretOrKey, (error, decoded) => {
      if (error) {
        res.status(401).json({ msg: 'Token is not valid' });
      } else {
        req.user = decoded.user
        next();
      }
    })
  } catch (err) {
    
    console.error('something wrong with auth middleware');
    console.log(err)
    res.status(500).json({ msg: 'Server Error' });
  }
};
