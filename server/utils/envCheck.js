const fs = require('fs');
const path = require('path');

/**
 * Checks if required environment variables are set
 * @param {string[]} requiredVars - Array of required variable names
 * @returns {Object} - Result of the check
 */
function checkEnvVariables(requiredVars) {
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });
  
  // Log the status
  console.log('\nEnvironment Variables Check:');
  present.forEach(v => console.log(`✅ ${v}: Set`));
  missing.forEach(v => console.error(`❌ ${v}: Missing`));
  
  return { 
    missing, 
    present, 
    allPresent: missing.length === 0 
  };
}

/**
 * Ensures the .env file exists and has the required variables
 * @param {string} envPath - Path to the .env file
 * @param {string[]} requiredVars - Array of required variable names
 * @returns {Object} - Result of the check
 */
function validateEnvFile(envPath, requiredVars) {
  let fileExists = false;
  let fileContents = '';
  let missingVars = [...requiredVars];
  
  try {
    fileExists = fs.existsSync(envPath);
    if (fileExists) {
      fileContents = fs.readFileSync(envPath, 'utf8');
      
      // Check which variables are present in the file
      requiredVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.+$`, 'm');
        if (regex.test(fileContents)) {
          missingVars = missingVars.filter(v => v !== varName);
        }
      });
    }
  } catch (err) {
    console.error('Error checking .env file:', err.message);
  }
  
  return {
    fileExists,
    missingVars,
    fileContents: fileExists ? '(File exists)' : '(File not found)',
    allVarsPresent: missingVars.length === 0
  };
}

module.exports = { checkEnvVariables, validateEnvFile };
