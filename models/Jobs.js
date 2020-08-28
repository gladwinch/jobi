const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobsInfo: [
      {
          skills: String,
          jobType: String,
          salary: String,
          remote: String,
          location: String,
          title: String,
      }
  ],
  settings: {
    emails: [String],
    active: {
      type: Boolean,
      default: true
    },
    adminActive: {
        type: Boolean,
        default: true
    },
    subscription: {
      expire: Number,
      status: Boolean
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
})

module.exports = Jobs = mongoose.model('jobs', JobSchema);
