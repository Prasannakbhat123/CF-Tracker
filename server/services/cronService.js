const cron = require('node-cron');
const Student = require('../models/Student');
const { syncCodeforcesData } = require('./codeforcesService');
const { checkInactivityAndNotify } = require('./inactivityService');

let cronJob = null;
let lastRunTime = null;
let isRunning = false;
let currentSchedule = '0 2 * * *'; // Default schedule

/**
 * Schedules the daily Codeforces data sync.
 * @param {string} schedule - Cron string (default: '0 2 * * *' for 2 AM daily)
 */
function startCron(schedule = '0 2 * * *') {
  if (cronJob) {
    console.log('Stopping existing cron job before creating a new one');
    cronJob.stop();
  }
  
  if (!cron.validate(schedule)) {
    console.error(`Invalid cron schedule: ${schedule}. Using default schedule instead.`);
    schedule = '0 2 * * *';
  }
  
  // Store the current schedule
  currentSchedule = schedule;
  
  // Log the parts of the schedule for debugging
  const parts = schedule.split(' ');
  console.log(`Scheduling cron job with: minute=${parts[0]}, hour=${parts[1]}, day of month=${parts[2]}, month=${parts[3]}, day of week=${parts[4]}`);
  
  cronJob = cron.schedule(schedule, async () => {
    await runSyncTask();
  });
  
  console.log(`Codeforces data sync cron job scheduled at: ${schedule}`);
  return true;
}

/**
 * Executes the sync task - can be called by cron or manually
 */
async function runSyncTask() {
  if (isRunning) {
    console.log('Sync already in progress, skipping this run');
    return { success: false, message: 'Sync already in progress' };
  }
  
  console.log(`Starting Codeforces data sync at ${new Date().toISOString()}`);
  isRunning = true;
  lastRunTime = new Date();
  
  try {
    const students = await Student.find();
    console.log(`Found ${students.length} students to sync`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const student of students) {
      try {
        console.log(`Syncing data for ${student.name} (${student.codeforcesHandle})`);
        const result = await syncCodeforcesData(student);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to sync data for ${student.codeforcesHandle}: ${result.error}`);
        }
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.error(`Error syncing data for ${student.codeforcesHandle}:`, error);
      }
    }
    
    console.log('Checking for inactive students...');
    await checkInactivityAndNotify();
    
    console.log(`Codeforces data sync completed at ${new Date().toISOString()}`);
    console.log(`Results: ${successCount} successful, ${errorCount} failed`);
    
    return { 
      success: true, 
      message: 'Sync completed successfully', 
      stats: { successCount, errorCount, total: students.length } 
    };
  } catch (error) {
    console.error('Error during Codeforces data sync:', error);
    return { success: false, message: `Sync failed: ${error.message}` };
  } finally {
    isRunning = false;
  }
}

/**
 * Allows updating the cron schedule at runtime.
 */
function updateCronSchedule(newSchedule) {
  return startCron(newSchedule);
}

/**
 * Returns the current status of the cron job
 */
function getCronStatus() {
  return {
    active: cronJob !== null,
    lastRun: lastRunTime,
    isRunning,
    schedule: currentSchedule
  };
}

module.exports = { 
  startCron, 
  updateCronSchedule, 
  runSyncTask, 
  getCronStatus 
};
