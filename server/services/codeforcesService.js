const axios = require('axios');
const crypto = require('crypto');
const Student = require('../models/Student');
const ContestHistory = require('../models/ContestHistory');
const ProblemSolving = require('../models/ProblemSolving');

// Codeforces API authentication with better error handling and manual setting if needed
let API_KEY = process.env.CODEFORCES_API_KEY;
let API_SECRET = process.env.CODEFORCES_API_SECRET;

// IMPORTANT: If credentials are still not being loaded from .env, manually set them here
// This is a fallback solution - still try to fix the .env loading issue
// if (!API_KEY || API_KEY === 'default_key_for_testing') {
//   console.warn('⚠️ API_KEY not found in environment, using hardcoded value as fallback');
//   API_KEY = 'd7ce94057d9771796d82ac7463a717aa332c3725';
// }

// if (!API_SECRET || API_SECRET === 'default_secret_for_testing') {
//   console.warn('⚠️ API_SECRET not found in environment, using hardcoded value as fallback');
//   API_SECRET = 'ec454184e488ed5e66ae1e46f464427df56dc04a';
// }

// More detailed logging about the credentials
console.log('\nCodeforces API Credentials Check:');
if (!API_KEY || API_KEY === 'default_key_for_testing') {
  console.error('❌ CODEFORCES_API_KEY is not set correctly');
  if (API_KEY === 'default_key_for_testing') {
    console.error('   Using a fallback value that will not work with the API');
  }
} else {
  // Only show a portion of the key for security
  const keyPreview = API_KEY.substring(0, 4) + '...' + API_KEY.substring(API_KEY.length - 4);
  console.log(`✅ CODEFORCES_API_KEY is configured: ${keyPreview}`);
}

if (!API_SECRET || API_SECRET === 'default_secret_for_testing') {
  console.error('❌ CODEFORCES_API_SECRET is not set correctly');
  if (API_SECRET === 'default_secret_for_testing') {
    console.error('   Using a fallback value that will not work with the API');
  }
} else {
  // Only show a portion of the secret for security
  const secretPreview = API_SECRET.substring(0, 4) + '...' + API_SECRET.substring(API_SECRET.length - 4);
  console.log(`✅ CODEFORCES_API_SECRET is configured: ${secretPreview}`);
}

if (!API_KEY || !API_SECRET || 
    API_KEY === 'default_key_for_testing' || 
    API_SECRET === 'default_secret_for_testing') {
  console.error('\n❌ WARNING: Codeforces API credentials are incomplete or invalid!');
  console.error('Please make sure both CODEFORCES_API_KEY and CODEFORCES_API_SECRET');
  console.error('are correctly set in your .env file. API calls will fail otherwise.\n');
}

/**
 * Generate a signature for Codeforces API authenticated requests
 * @param {string} methodName - The API method being called
 * @param {Object} params - Query parameters
 * @returns {Object} - Parameters with authentication data
 */
function generateAuthenticatedParams(methodName, params = {}) {
  // We've already set fallback values, so this should not throw an error anymore
  if (!API_KEY || !API_SECRET) {
    const missingVars = [];
    if (!API_KEY) missingVars.push('CODEFORCES_API_KEY');
    if (!API_SECRET) missingVars.push('CODEFORCES_API_SECRET');
    
    throw new Error(
      `Codeforces API credentials are not configured. Missing: ${missingVars.join(', ')}. ` +
      'Please check your .env file and restart the server.'
    );
  }
  
  // Generate random value (6 digits) as specified in Codeforces API docs
  const rand = Math.floor(100000 + Math.random() * 900000); 
  
  // Clean up parameters to ensure proper encoding
  const cleanParams = {};
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      cleanParams[key] = String(params[key]);
    }
  }
  
  // Add authentication parameters (but not apiSig yet)
  const authParams = {
    ...cleanParams,
    apiKey: API_KEY,
    time: Math.floor(Date.now() / 1000)
  };
  
  // Generate signature (exactly as Codeforces expects)
  const paramKeys = Object.keys(authParams).sort();
  let signatureBase = `${methodName}?`;
  
  paramKeys.forEach((key, index) => {
    signatureBase += `${key}=${authParams[key]}`;
    if (index < paramKeys.length - 1) {
      signatureBase += '&';
    }
  });
  
  // Add secret at the end and create hash
  signatureBase += `#${API_SECRET}`;
  
  // Log the signature base for debugging
  console.log(`Signature base: ${signatureBase}`);
  
  // Create hex digest using SHA-512
  const hash = crypto.createHash('sha512').update(signatureBase).digest('hex');
  
  // Format the apiSig parameter exactly as Codeforces requires: {rand}/{hash}
  return {
    ...authParams,
    apiSig: `${rand}/${hash}`
  };
}

/**
 * Fetches and updates Codeforces user data for a given handle.
 * Stores contest history and problem-solving data in the database.
 * @param {Object} student - Student object with codeforcesHandle
 * @param {boolean} testMode - If true, don't save to database
 * @returns {Object} - Result of the operation
 */
async function syncCodeforcesData(student, testMode = false) {
  console.log(`Starting sync for ${student.codeforcesHandle}${testMode ? ' (TEST MODE)' : ''}`);
  
  try {
    // Fetch user info with authentication
    console.log(`Fetching user info for ${student.codeforcesHandle}`);
    const userParams = generateAuthenticatedParams('user.info', { handles: student.codeforcesHandle });
    
    // Log full request details for debugging
    console.log(`API Request: https://codeforces.com/api/user.info with params:`, JSON.stringify(userParams, null, 2));
    
    const userInfoRes = await axios.get(`https://codeforces.com/api/user.info`, {
      params: userParams,
      timeout: 10000 // 10 second timeout
    });
    
    if (!userInfoRes.data || !userInfoRes.data.result || userInfoRes.data.result.length === 0) {
      console.error(`No user data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No user data returned from Codeforces API' };
    }
    
    const user = userInfoRes.data.result[0];

    // In test mode, we don't update the database
    if (!testMode) {
      // Update ratings - ensure they're stored as numbers
      student.currentRating = user.rating ? Number(user.rating) : 0;
      student.maxRating = user.maxRating ? Number(user.maxRating) : 0;
      student.lastSynced = new Date();
      await student.save();
      console.log(`Updated ratings for ${student.codeforcesHandle}: current=${student.currentRating}, max=${student.maxRating}`);
    }

    // Fetch contest history with authentication
    console.log(`Fetching contest history for ${student.codeforcesHandle}`);
    const contestParams = generateAuthenticatedParams('user.rating', { handle: student.codeforcesHandle });
    const contestRes = await axios.get(`https://codeforces.com/api/user.rating`, {
      params: contestParams,
      timeout: 10000
    });
    
    if (!contestRes.data || !contestRes.data.result) {
      console.error(`No contest data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No contest data returned from Codeforces API' };
    }
    
    const contests = contestRes.data.result;
    
    if (!testMode) {
      await ContestHistory.deleteMany({ student: student._id });
      
      if (contests.length > 0) {
        await ContestHistory.insertMany(
          contests.map(c => ({
            student: student._id,
            contestId: c.contestId,
            contestName: c.contestName,
            rank: c.rank,
            oldRating: c.oldRating,
            newRating: c.newRating,
            ratingChange: c.newRating - c.oldRating,
            date: new Date(c.ratingUpdateTimeSeconds * 1000),
            problemsUnsolved: 0 // Placeholder, calculate if needed
          }))
        );
        console.log(`Stored ${contests.length} contest entries for ${student.codeforcesHandle}`);
      } else {
        console.log(`No contests found for ${student.codeforcesHandle}`);
      }
    }

    // Fetch submissions with authentication
    console.log(`Fetching submissions for ${student.codeforcesHandle}`);
    const submissionParams = generateAuthenticatedParams('user.status', { handle: student.codeforcesHandle });
    const submissionsRes = await axios.get(`https://codeforces.com/api/user.status`, {
      params: submissionParams,
      timeout: 10000
    });
    
    if (!submissionsRes.data || !submissionsRes.data.result) {
      console.error(`No submission data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No submission data returned from Codeforces API' };
    }
    
    const submissions = submissionsRes.data.result;
    const solved = {};
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const pid = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solved[pid]) {
          solved[pid] = {
            student: student._id,
            problemId: pid,
            problemName: sub.problem.name,
            rating: sub.problem.rating || null,
            dateSolved: new Date(sub.creationTimeSeconds * 1000),
            tags: sub.problem.tags || []
          };
        }
      }
    });
    
    if (!testMode) {
      await ProblemSolving.deleteMany({ student: student._id });
      
      const solvedProblems = Object.values(solved);
      if (solvedProblems.length > 0) {
        await ProblemSolving.insertMany(solvedProblems);
        console.log(`Stored ${solvedProblems.length} solved problems for ${student.codeforcesHandle}`);
      } else {
        console.log(`No solved problems found for ${student.codeforcesHandle}`);
      }
    }
    
    console.log(`Sync completed successfully for ${student.codeforcesHandle}`);
    
    // If in test mode, return more data for verification
    if (testMode) {
      // Get the 5 most recent submissions
      const recentSubmissions = submissions
        .slice(0, 10)
        .map(sub => ({
          problemName: sub.problem.name,
          contestId: sub.problem.contestId,
          index: sub.problem.index,
          verdict: sub.verdict,
          time: new Date(sub.creationTimeSeconds * 1000).toISOString(),
          rating: sub.problem.rating
        }));
      
      return { 
        success: true,
        userData: {
          handle: user.handle,
          rating: user.rating,
          maxRating: user.maxRating,
          rank: user.rank,
          maxRank: user.maxRank
        },
        contestCount: contests.length,
        problemCount: Object.keys(solved).length,
        recentSubmissions
      };
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Codeforces sync error for ${student.codeforcesHandle}:`, err.message);
    // Additional error details if available
    if (err.response) {
      console.error(`Status: ${err.response.status}`, err.response.data);
    }
    return { success: false, error: err.message };
  }
}

/**
 * Try fetching Codeforces data without authentication
 * This is an alternative if authentication is still problematic
 */
async function syncCodeforcesDataWithoutAuth(student, testMode = false) {
  console.log(`Starting sync without auth for ${student.codeforcesHandle}${testMode ? ' (TEST MODE)' : ''}`);
  
  try {
    // Fetch user info without authentication
    console.log(`Fetching user info for ${student.codeforcesHandle} (without auth)`);
    const userInfoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${student.codeforcesHandle}`, {
      timeout: 10000
    });
    
    if (!userInfoRes.data || !userInfoRes.data.result || userInfoRes.data.result.length === 0) {
      console.error(`No user data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No user data returned from Codeforces API' };
    }
    
    const user = userInfoRes.data.result[0];
    
    // Update student in database if not in test mode
    if (!testMode) {
      student.currentRating = user.rating || 0;
      student.maxRating = user.maxRating || 0;
      student.lastSynced = new Date();
      await student.save();
    }
    
    // Fetch contest history without authentication
    console.log(`Fetching contest history for ${student.codeforcesHandle} (without auth)`);
    const contestRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${student.codeforcesHandle}`, {
      timeout: 10000
    });
    
    if (!contestRes.data || !contestRes.data.result) {
      console.error(`No contest data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No contest data returned from Codeforces API' };
    }
    
    const contests = contestRes.data.result;
    
    // Process and store contest data if not in test mode
    if (!testMode) {
      await ContestHistory.deleteMany({ student: student._id });
      
      if (contests.length > 0) {
        await ContestHistory.insertMany(
          contests.map(c => ({
            student: student._id,
            contestId: c.contestId,
            contestName: c.contestName,
            rank: c.rank,
            oldRating: c.oldRating,
            newRating: c.newRating,
            ratingChange: c.newRating - c.oldRating,
            date: new Date(c.ratingUpdateTimeSeconds * 1000),
            problemsUnsolved: 0
          }))
        );
      }
    }
    
    // Fetch submissions without authentication
    console.log(`Fetching submissions for ${student.codeforcesHandle} (without auth)`);
    const submissionsRes = await axios.get(`https://codeforces.com/api/user.status?handle=${student.codeforcesHandle}`, {
      timeout: 10000
    });
    
    if (!submissionsRes.data || !submissionsRes.data.result) {
      console.error(`No submission data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No submission data returned from Codeforces API' };
    }
    
    const submissions = submissionsRes.data.result;
    const solved = {};
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const pid = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solved[pid]) {
          solved[pid] = {
            student: student._id,
            problemId: pid,
            problemName: sub.problem.name,
            rating: sub.problem.rating || null,
            dateSolved: new Date(sub.creationTimeSeconds * 1000),
            tags: sub.problem.tags || []
          };
        }
      }
    });
    
    // Process and store problem data if not in test mode
    if (!testMode) {
      await ProblemSolving.deleteMany({ student: student._id });
      
      const solvedProblems = Object.values(solved);
      if (solvedProblems.length > 0) {
        await ProblemSolving.insertMany(solvedProblems);
      }
    }
    
    // Return data for test mode
    if (testMode) {
      const recentSubmissions = submissions
        .slice(0, 10)
        .map(sub => ({
          problemName: sub.problem.name,
          contestId: sub.problem.contestId,
          index: sub.problem.index,
          verdict: sub.verdict,
          time: new Date(sub.creationTimeSeconds * 1000).toISOString(),
          rating: sub.problem.rating
        }));
      
      return { 
        success: true,
        userData: {
          handle: user.handle,
          rating: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank: user.rank,
          maxRank: user.maxRank
        },
        contestCount: contests.length,
        problemCount: Object.keys(solved).length,
        recentSubmissions
      };
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Codeforces sync error (without auth) for ${student.codeforcesHandle}:`, err.message);
    if (err.response) {
      console.error(`Status: ${err.response.status}`, err.response.data);
    }
    return { success: false, error: err.message };
  }
}

// Modify the original function to try both approaches
async function syncCodeforcesData(student, testMode = false) {
  try {
    // First try with authentication
    const result = await syncCodeforcesDataWithAuth(student, testMode);
    if (result.success) {
      return result;
    }
    
    // If authentication fails, try without authentication
    console.log(`Authentication failed, trying without auth for ${student.codeforcesHandle}`);
    return await syncCodeforcesDataWithoutAuth(student, testMode);
  } catch (err) {
    console.error(`Error in syncCodeforcesData for ${student.codeforcesHandle}:`, err.message);
    return { success: false, error: err.message };
  }
}

// Rename the original function
async function syncCodeforcesDataWithAuth(student, testMode = false) {
  console.log(`Starting sync with auth for ${student.codeforcesHandle}${testMode ? ' (TEST MODE)' : ''}`);
  
  try {
    // Fetch user info with authentication
    console.log(`Fetching user info for ${student.codeforcesHandle}`);
    const userParams = generateAuthenticatedParams('user.info', { handles: student.codeforcesHandle });
    
    // Log full request details for debugging
    console.log(`API Request: https://codeforces.com/api/user.info with params:`, JSON.stringify(userParams, null, 2));
    
    const userInfoRes = await axios.get(`https://codeforces.com/api/user.info`, {
      params: userParams,
      timeout: 10000 // 10 second timeout
    });
    
    if (!userInfoRes.data || !userInfoRes.data.result || userInfoRes.data.result.length === 0) {
      console.error(`No user data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No user data returned from Codeforces API' };
    }
    
    const user = userInfoRes.data.result[0];

    // In test mode, we don't update the database
    if (!testMode) {
      // Update ratings - ensure they're stored as numbers
      student.currentRating = user.rating ? Number(user.rating) : 0;
      student.maxRating = user.maxRating ? Number(user.maxRating) : 0;
      student.lastSynced = new Date();
      await student.save();
      console.log(`Updated ratings for ${student.codeforcesHandle}: current=${student.currentRating}, max=${student.maxRating}`);
    }

    // Fetch contest history with authentication
    console.log(`Fetching contest history for ${student.codeforcesHandle}`);
    const contestParams = generateAuthenticatedParams('user.rating', { handle: student.codeforcesHandle });
    const contestRes = await axios.get(`https://codeforces.com/api/user.rating`, {
      params: contestParams,
      timeout: 10000
    });
    
    if (!contestRes.data || !contestRes.data.result) {
      console.error(`No contest data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No contest data returned from Codeforces API' };
    }
    
    const contests = contestRes.data.result;
    
    if (!testMode) {
      await ContestHistory.deleteMany({ student: student._id });
      
      if (contests.length > 0) {
        await ContestHistory.insertMany(
          contests.map(c => ({
            student: student._id,
            contestId: c.contestId,
            contestName: c.contestName,
            rank: c.rank,
            oldRating: c.oldRating,
            newRating: c.newRating,
            ratingChange: c.newRating - c.oldRating,
            date: new Date(c.ratingUpdateTimeSeconds * 1000),
            problemsUnsolved: 0 // Placeholder, calculate if needed
          }))
        );
        console.log(`Stored ${contests.length} contest entries for ${student.codeforcesHandle}`);
      } else {
        console.log(`No contests found for ${student.codeforcesHandle}`);
      }
    }

    // Fetch submissions with authentication
    console.log(`Fetching submissions for ${student.codeforcesHandle}`);
    const submissionParams = generateAuthenticatedParams('user.status', { handle: student.codeforcesHandle });
    const submissionsRes = await axios.get(`https://codeforces.com/api/user.status`, {
      params: submissionParams,
      timeout: 10000
    });
    
    if (!submissionsRes.data || !submissionsRes.data.result) {
      console.error(`No submission data returned for ${student.codeforcesHandle}`);
      return { success: false, error: 'No submission data returned from Codeforces API' };
    }
    
    const submissions = submissionsRes.data.result;
    const solved = {};
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const pid = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solved[pid]) {
          solved[pid] = {
            student: student._id,
            problemId: pid,
            problemName: sub.problem.name,
            rating: sub.problem.rating || null,
            dateSolved: new Date(sub.creationTimeSeconds * 1000),
            tags: sub.problem.tags || []
          };
        }
      }
    });
    
    if (!testMode) {
      await ProblemSolving.deleteMany({ student: student._id });
      
      const solvedProblems = Object.values(solved);
      if (solvedProblems.length > 0) {
        await ProblemSolving.insertMany(solvedProblems);
        console.log(`Stored ${solvedProblems.length} solved problems for ${student.codeforcesHandle}`);
      } else {
        console.log(`No solved problems found for ${student.codeforcesHandle}`);
      }
    }
    
    console.log(`Sync completed successfully for ${student.codeforcesHandle}`);
    
    // If in test mode, return more data for verification
    if (testMode) {
      // Get the 5 most recent submissions
      const recentSubmissions = submissions
        .slice(0, 10)
        .map(sub => ({
          problemName: sub.problem.name,
          contestId: sub.problem.contestId,
          index: sub.problem.index,
          verdict: sub.verdict,
          time: new Date(sub.creationTimeSeconds * 1000).toISOString(),
          rating: sub.problem.rating
        }));
      
      return { 
        success: true,
        userData: {
          handle: user.handle,
          rating: user.rating,
          maxRating: user.maxRating,
          rank: user.rank,
          maxRank: user.maxRank
        },
        contestCount: contests.length,
        problemCount: Object.keys(solved).length,
        recentSubmissions
      };
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Codeforces sync error for ${student.codeforcesHandle}:`, err.message);
    // Additional error details if available
    if (err.response) {
      console.error(`Status: ${err.response.status}`, err.response.data);
    }
    return { success: false, error: err.message };
  }
}

module.exports = { syncCodeforcesData };
