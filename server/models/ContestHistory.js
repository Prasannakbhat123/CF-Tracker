const mongoose = require('mongoose');

const contestHistorySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  contestId: Number,
  contestName: String,
  rank: Number,
  oldRating: Number,
  newRating: Number,
  ratingChange: Number,
  problemsUnsolved: Number,
  date: Date
});

module.exports = mongoose.model('ContestHistory', contestHistorySchema);
