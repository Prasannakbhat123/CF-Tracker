const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const studentController = require('../controllers/studentController');
const { runSyncTask, getCronStatus, updateCronSchedule } = require('../services/cronService');
const { syncCodeforcesData } = require('../services/codeforcesService');
// Import the inactivity service
const { checkInactivityAndNotify } = require('../services/inactivityService');

// Import the models that are missing
const Student = require('../models/Student');
const ContestHistory = require('../models/ContestHistory');
const ProblemSolving = require('../models/ProblemSolving');

// Student CRUD
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.patch('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);

// Contest history and problem data routes
router.get('/students/:id/contests', async (req, res) => {
  try {
    const contests = await ContestHistory.find({ student: req.params.id }).sort({ date: -1 });
    res.json(contests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id/problems', async (req, res) => {
  try {
    const problems = await ProblemSolving.find({ student: req.params.id }).sort({ dateSolved: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual sync for a specific student
router.post('/students/:id/sync', studentController.syncStudentData);

// Inactivity monitoring endpoints
router.post('/inactivity/check', async (req, res) => {
  try {
    await checkInactivityAndNotify();
    res.json({ success: true, message: 'Inactivity check completed successfully' });
  } catch (error) {
    console.error('Error running inactivity check:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inactivity/stats', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Count students with no activity in the last 7 days
    const inactiveStudents = await Student.find({ 
      emailNotifications: true,
      lastSynced: { $exists: true }
    });
    
    let inactiveCount = 0;
    
    // Check each student's problem solving activity
    for (const student of inactiveStudents) {
      const recentSolve = await ProblemSolving.findOne({
        student: student._id,
        dateSolved: { $gte: sevenDaysAgo }
      });
      
      if (!recentSolve) {
        inactiveCount++;
      }
    }
    
    // Calculate total reminders sent
    const totalEmails = await Student.aggregate([
      { $match: { remindersSent: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, totalReminders: { $sum: '$remindersSent' } } }
    ]);
    
    const lastRun = (await Student.findOne({ remindersSent: { $gt: 0 } })
      .sort({ updatedAt: -1 }))?.updatedAt;
    
    res.json({
      inactiveCount,
      totalEmails: totalEmails.length > 0 ? totalEmails[0].totalReminders : 0,
      lastRun
    });
  } catch (error) {
    console.error('Error getting inactivity stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if a Codeforces handle already exists
router.get('/check-handle/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const exists = await Student.findOne({ codeforcesHandle: handle });
    res.json({ exists: !!exists, id: exists ? exists._id : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test Codeforces API without creating a student
router.get('/test-codeforces/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const { useAuth } = req.query; // Add a query parameter to control auth usage
    
    if (!handle) {
      return res.status(400).json({ error: 'Codeforces handle is required' });
    }
    
    console.log(`Testing Codeforces data fetch for handle: ${handle}`);
    
    // Create a temporary student object (not saved to DB)
    const tempStudent = {
      _id: new mongoose.Types.ObjectId(),
      codeforcesHandle: handle
    };
    
    // Use the syncCodeforcesData function but don't save to DB
    const result = await syncCodeforcesData(tempStudent, true); // Pass true to indicate test mode
    
    if (result.success) {
      res.json({
        message: 'Successfully fetched data from Codeforces',
        userData: result.userData,
        contestCount: result.contestCount,
        problemCount: result.problemCount,
        recentSubmissions: result.recentSubmissions
      });
    } else {
      res.status(500).json({ 
        error: result.error,
        details: "Failed to fetch Codeforces data. See server logs for details."
      });
    }
  } catch (error) {
    console.error('Error in test-codeforces endpoint:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      details: "An error occurred while testing Codeforces API."
    });
  }
});

// Cron job management routes
router.post('/sync/codeforces', async (req, res) => {
  try {
    const result = await runSyncTask();
    res.json(result);  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sync/status', (req, res) => {
  try {
    // Get the cron status
    const status = getCronStatus();
    
    // Send the response
    res.json(status);
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving cron status', 
      error: error.message 
    });
  }
});


router.post('/sync/schedule', (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule) {
      return res.status(400).json({ success: false, message: 'Schedule is required' });
    }
    
    const success = updateCronSchedule(schedule);
    if (success) {
      res.json({ success: true, message: 'Cron schedule updated', schedule });
    } else {
      res.status(400).json({ success: false, message: 'Invalid cron schedule' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware for student routes
router.use((err, req, res, next) => {
  console.error('Error in student routes:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

module.exports = router;
