const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const { startCron } = require('./services/cronService');
const { checkEnvVariables, validateEnvFile } = require('./utils/envCheck');

// Define paths for potential .env files
const possibleEnvPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env')
];

// Try to find and load .env file
let envLoaded = false;
let loadedPath = '';

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Found .env file at: ${envPath}`);
    try {
      // Read the file content to check
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log(`\nContent of .env file (credentials partially masked):`);
      envContent.split('\n').forEach(line => {
        if (line.trim() && !line.trim().startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('='); // In case value contains = characters
          if (key && value) {
            const trimmedKey = key.trim();
            // Mask sensitive values for logging
            const maskedValue = trimmedKey.includes('KEY') || trimmedKey.includes('SECRET') || 
                               trimmedKey.includes('PASS') || trimmedKey.includes('URI') ?
                               value.substring(0, 4) + '...' + value.substring(value.length - 4) : value;
            console.log(`${trimmedKey}=${maskedValue}`);
          }
        }
      });
      
      // Now load the environment variables
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.error(`Error loading .env from ${envPath}:`, result.error);
      } else {
        envLoaded = true;
        loadedPath = envPath;
        break;
      }
    } catch (err) {
      console.error(`Error reading .env file at ${envPath}:`, err);
    }
  }
}

if (!envLoaded) {
  console.error('No .env file found. Checking the following paths:');
  possibleEnvPaths.forEach(p => console.error(`- ${p}`));
  
  // Create a template .env file
  const templateEnvPath = path.resolve(__dirname, '.env');
  try {
    if (!fs.existsSync(templateEnvPath)) {
      const templateContent = 
`PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CRON_SCHEDULE=0 2 * * *
CODEFORCES_API_KEY=your_codeforces_api_key
CODEFORCES_API_SECRET=your_codeforces_api_secret`;

      fs.writeFileSync(templateEnvPath, templateContent);
      console.log(`Created template .env file at ${templateEnvPath}`);
      console.log('Please fill in the required variables and restart the server.');
    }
  } catch (err) {
    console.error('Error creating template .env file:', err);
  }
}

// Verify critical environment variables
const requiredEnvVars = ['MONGO_URI', 'CODEFORCES_API_KEY', 'CODEFORCES_API_SECRET'];

// Validate the .env file content
if (loadedPath) {
  const fileValidation = validateEnvFile(loadedPath, requiredEnvVars);
  
  if (fileValidation.missingVars.length > 0) {
    console.error('\n❌ Some required variables are missing from your .env file:');
    fileValidation.missingVars.forEach(v => console.error(`  - ${v}`));
    console.error(`Please add these variables to: ${loadedPath}`);
  }
}

// Check if variables are actually loaded in the environment
const envCheck = checkEnvVariables(requiredEnvVars);

if (!envCheck.allPresent) {
  console.error('\n❌ ERROR: Missing required environment variables in runtime!');
  console.error('Please set these in your .env file and restart the server:');
  envCheck.missing.forEach(v => console.error(`  - ${v}`));
}

// Set defaults for missing credentials to avoid crashes
// (not for production use, just to allow the server to start)
if (!process.env.CODEFORCES_API_KEY) {
  process.env.CODEFORCES_API_KEY = 'default_key_for_testing';
  console.warn('⚠️ Using default API key for testing. API calls will likely fail.');
}

if (!process.env.CODEFORCES_API_SECRET) {
  process.env.CODEFORCES_API_SECRET = 'default_secret_for_testing';
  console.warn('⚠️ Using default API secret for testing. API calls will likely fail.');
}

// Continue with the server setup
const app = express();
app.use(cors());
app.use(express.json());

// Add route to check environment variables
app.get('/api/env-check', (req, res) => {
  const configStatus = {
    envFileLoaded: envLoaded,
    envFilePath: loadedPath || 'Not found',
    requiredVariables: requiredEnvVars.map(name => ({
      name,
      set: !!process.env[name],
      // Don't return actual values for security
      value: process.env[name] ? '[REDACTED]' : undefined
    })),
    mongoConnectionString: process.env.MONGO_URI ? 
      process.env.MONGO_URI.substring(0, 20) + '...' : 
      'Not set'
  };
  
  res.json(configStatus);
});

// Add routes
app.use('/api', studentRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      apiCredentialsConfigured: !!process.env.CODEFORCES_API_KEY && !!process.env.CODEFORCES_API_SECRET
    }
  });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start cron job after DB connection
    const cronSchedule = process.env.CRON_SCHEDULE || '0 2 * * *';
    console.log(`Initializing cron job with schedule: ${cronSchedule}`);
    const cronStarted = startCron(cronSchedule);
    console.log(cronStarted ? 'Cron job started successfully' : 'Failed to start cron job');
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API available at http://localhost:${port}/api`);
      console.log(`Health check available at http://localhost:${port}/health`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
