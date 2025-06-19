const mongoose = require('mongoose');

const problemSolvingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  problemId: String,
  problemName: String,
  rating: Number,
  dateSolved: Date,
  tags: [String]
});

module.exports = mongoose.model('ProblemSolving', problemSolvingSchema);
