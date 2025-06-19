# CF-Tracker Backend

This directory contains the backend server for the Codeforces Tracker application. The backend is built with Node.js and Express, and it provides RESTful APIs for the frontend to interact with the MongoDB database and the Codeforces API.

## 📁 Directory Structure

```
server/
├── controllers/            # API controllers for route handling
├── middleware/             # Express middleware functions
├── models/                 # Mongoose data models
├── routes/                 # API route definitions
├── scripts/                # Utility scripts for administrative tasks
├── services/               # Core business logic services
├── utils/                  # Helper functions and utilities
├── .env                    # Environment variables (not tracked in git)
├── package.json            # NPM dependencies and scripts
└── server.js               # Main entry point for the application
```

## 🔧 Components

### 📄 server.js

The main entry point for the application. It:
- Configures Express middleware (CORS, JSON parsing, etc.)
- Searches for and loads environment variables from .env files
- Connects to MongoDB
- Registers API routes
- Initializes the cron job for scheduled tasks
- Starts the HTTP server on the configured port

### 📁 controllers/

Contains controller modules that handle the business logic for API endpoints:

- **authController.js** - Manages authentication-related operations:
  - User registration and login
  - JWT token generation and validation
  - Password handling with bcrypt

- **studentController.js** - Handles student data operations:
  - CRUD operations for student profiles
  - Codeforces data synchronization
  - Contest history and problem-solving data retrieval
  - Inactivity status management

### 📁 middleware/

Contains Express middleware functions:

- **authMiddleware.js** - Authentication middleware:
  - Validates JWT tokens for protected routes
  - Extracts user information from tokens
  - Handles authorization for admin-only routes

### 📁 models/

Contains Mongoose schema definitions for database models:

- **Admin.js** - Schema for administrator accounts:
  - Username and password (hashed)
  - Admin privileges and metadata

- **Student.js** - Schema for student profiles:
  - Personal information (name, email, phone)
  - Codeforces handle and current rating
  - Email notification preferences
  - Reminders sent count and timestamps

- **ContestHistory.js** - Schema for Codeforces contest participation:
  - Contest details and dates
  - Performance metrics (rank, rating change)
  - Reference to student

- **ProblemSolving.js** - Schema for problem-solving data:
  - Problem details (ID, name, tags, difficulty)
  - Submission data (date, status)
  - Reference to student

### 📁 routes/

Contains API route definitions:

- **authRoutes.js** - Authentication-related routes:
  - POST /api/auth/login - User login
  - POST /api/auth/register - User registration (admin only)
  - GET /api/auth/verify - Token verification

- **studentRoutes.js** - Student data-related routes:
  - GET /api/students - Get all students
  - POST /api/students - Create a new student
  - GET /api/students/:id - Get a specific student
  - PUT /api/students/:id - Update a student
  - DELETE /api/students/:id - Delete a student
  - GET /api/students/:id/contests - Get contest history
  - GET /api/students/:id/problems - Get problem-solving data
  - PUT /api/students/:id/notifications - Toggle email notifications
  - POST /api/students/sync - Trigger manual data sync

### 📁 scripts/

Contains standalone scripts for administrative tasks:

- **createAdmin.js** - Script for creating admin accounts:
  - Prompts for username and password
  - Creates an admin user in the database
  - Handles validation and error cases

### 📁 services/

Contains core business logic modules:

- **codeforcesService.js** - Handles Codeforces API integration:
  - Fetches user information and rating history
  - Retrieves contest participation data
  - Gets problem-solving statistics
  - Manages API authentication and rate limiting

- **cronService.js** - Manages scheduled tasks:
  - Configures and runs cron jobs for data synchronization
  - Provides APIs for cron job status and configuration
  - Handles manual sync triggers and error recovery

- **inactivityService.js** - Manages student inactivity detection:
  - Identifies students without recent activity
  - Triggers email notifications
  - Updates student reminder counters

### 📁 utils/

Contains helper functions and utilities:

- **csvExport.js** - Handles data export functionality:
  - Converts student data to CSV format
  - Provides formatting and filtering options

- **emailService.js** - Manages email communications:
  - Configures Nodemailer for SMTP
  - Sends inactivity reminder emails
  - Handles email template rendering

- **envCheck.js** - Validates environment configuration:
  - Checks for required environment variables
  - Provides helpful error messages for missing configurations

## 🔄 Data Flow

1. The frontend makes API requests to the backend server
2. Express routes direct the requests to the appropriate controllers
3. Controllers use models to interact with the database
4. Services handle complex business logic and external API interactions
5. Middleware functions handle authentication and request preprocessing
6. Scheduled tasks run via cron jobs to keep data synchronized

## 🔒 Authentication

The backend uses JWT (JSON Web Tokens) for authentication:
- Tokens are generated on successful login
- Protected routes verify token validity via middleware
- Tokens contain encoded user information (ID, username, role)
- Token expiration is configurable via environment variables

## 📡 External API Integration

The backend integrates with the Codeforces API:
- Fetches user profile information
- Retrieves contest participation history
- Gets problem-solving statistics
- Handles API authentication and rate limiting
- Provides error handling and retry mechanisms

## 🔔 Notification System

The backend implements an email notification system:
- Detects student inactivity (no problems solved in 7+ days)
- Sends reminder emails via SMTP (configurable)
- Tracks notification history and frequency
- Allows toggling notifications per student

## ⚙️ Environment Configuration

The backend requires the following environment variables in a `.env` file:

```
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Codeforces API
CODEFORCES_API_KEY=your_codeforces_api_key
CODEFORCES_API_SECRET=your_codeforces_api_secret

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@example.com

# Application Settings
PORT=5000
NODE_ENV=development
```

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the required environment variables

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Create an admin account:
   ```bash
   node scripts/createAdmin.js
   ```

5. Access the API at `http://localhost:5000`
