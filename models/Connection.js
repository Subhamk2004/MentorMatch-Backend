// server/models/Connection.js
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Prevent duplicate connections
connectionSchema.index({ mentor: 1, mentee: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);