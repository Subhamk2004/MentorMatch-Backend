const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  bio: String,
  skills: [String],
  interests: [String],
  experience: String,
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends']
  }
});

module.exports = mongoose.model('Profile', profileSchema);