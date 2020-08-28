const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  titles: {
    type: [String],
  },
  jobtype: {
    type: [String],
    default: ['All']
  },
  location: {
    type: [String],
  },
  company: {
    type: [String],
    default: ['All']
  },
  salary: {
    type: [String],
    default: ['Any']
  },
  skills: {
    type: [String],
  },
  notification: {
    emailid: {
      value: {
        type: String,
        default: ''
      },
      active: {
        type: Boolean,
        default: false
      },
    },
    whatsapp: {
      value: {
        type: String,
        default: ''
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    telegram: {
      value: {
        type: String,
        default: ''
      },
      active: {
        type: Boolean,
        default: false
      },
    },
    adminactive: {
      type: Boolean,
      default: true
    },
  },
  subscription: {
    type: Number,
    default: 1
  }
})

module.exports = Profile = mongoose.model('profile', ProfileSchema);
