if (process.env.NODE_ENV === 'production') {
    module.exports = require('./firebase_prod');
  } else {
    module.exports = require('./firebase_dev');
  }
  