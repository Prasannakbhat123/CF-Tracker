const Student = require('../models/Student');
const ProblemSolving = require('../models/ProblemSolving');
const { sendInactivityEmail } = require('../utils/emailService');

/**
 * Checks for inactive students and sends reminder emails.
 */
async function checkInactivityAndNotify() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const students = await Student.find({ emailNotifications: true });

  for (const student of students) {
    const recentSolve = await ProblemSolving.findOne({
      student: student._id,
      dateSolved: { $gte: sevenDaysAgo }
    });
    if (!recentSolve) {
      await sendInactivityEmail(student.email, student.name);
      student.remindersSent = (student.remindersSent || 0) + 1;
      await student.save();
    }
  }
}

module.exports = { checkInactivityAndNotify };
