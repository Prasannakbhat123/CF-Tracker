const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  codeforcesHandle: { type: String, required: true, unique: true },
  currentRating: Number,
  maxRating: Number,
  lastSynced: Date,
  remindersSent: { type: Number, default: 0 },
  emailNotifications: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
