const Student = require('../models/Student');
const ContestHistory = require('../models/ContestHistory');
const ProblemSolving = require('../models/ProblemSolving');
const { syncCodeforcesData } = require('../services/codeforcesService');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    
    try {
      // Wait for Codeforces data sync to complete
      console.log(`Syncing Codeforces data for new student: ${student.codeforcesHandle}`);
      const syncResult = await syncCodeforcesData(student);
      
      if (syncResult.success) {
        // Refresh the student data to get the updated ratings
        const updatedStudent = await Student.findById(student._id);
        console.log(`Sync successful, returning updated student data with ratings`);
        return res.status(201).json(updatedStudent);
      } else {
        console.warn(`Sync failed for new student: ${syncResult.error}`);
        // Still return the student, but without the ratings
        return res.status(201).json(student);
      }
    } catch (syncErr) {
      console.error(`Error syncing new student data: ${syncErr.message}`);
      // Still return the student even if sync failed
      return res.status(201).json(student);
    }
  } catch (err) {
    // Check for duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ 
        error: `A student with this ${field} already exists: ${value}`,
        field,
        value
      });
    }
    res.status(400).json({ error: err.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ error: 'Student not found' });
    
    const oldHandle = oldStudent.codeforcesHandle;
    
    try {
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // If Codeforces handle was updated, sync the data immediately
      if (req.body.codeforcesHandle && req.body.codeforcesHandle !== oldHandle) {
        console.log(`Codeforces handle changed from ${oldHandle} to ${student.codeforcesHandle}. Syncing data...`);
        syncCodeforcesData(student).catch(err => 
          console.error(`Error syncing updated student data: ${err.message}`)
        );
      }
      
      res.json(student);
    } catch (updateErr) {
      // Check for duplicate key error
      if (updateErr.code === 11000) {
        const field = Object.keys(updateErr.keyPattern)[0];
        const value = updateErr.keyValue[field];
        return res.status(400).json({ 
          error: `A student with this ${field} already exists: ${value}`,
          field,
          value
        });
      }
      throw updateErr;
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get contest history for a student
exports.getContestHistory = async (req, res) => {
  try {
    const contests = await ContestHistory.find({ student: req.params.id });
    res.json(contests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get problem solving data for a student
exports.getProblemSolving = async (req, res) => {
  try {
    const problems = await ProblemSolving.find({ student: req.params.id });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manually sync Codeforces data for a student
exports.syncStudentData = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    console.log(`Manual sync requested for student: ${student.name} (${student.codeforcesHandle})`);
    const result = await syncCodeforcesData(student);
    
    if (result.success) {
      res.json({ success: true, message: 'Sync completed successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
