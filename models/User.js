const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscription: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  location: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  stripeSubscriptionID: {
    type: String
  },
  avatar: {
    type: String
  },
  googleId: {
    type: String
  },
  linkedinId: {
    type: String
  },
  facebookId: {
    type: String
  },
  githubId: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
