const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  searchs: [
      {
          skills: String,
          jobType: String,
          salary: String,
          remote: String,
          location: String,
          title: String
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
    subscription: Number
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

module.exports = Search = mongoose.model('search', SearchSchema)
