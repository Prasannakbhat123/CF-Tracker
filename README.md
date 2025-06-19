# Codeforces Tracker (CF-Tracker)

![GitHub last commit](https://img.shields.io/github/last-commit/Prasannakbhat123/CF-Tracker)

A comprehensive web application to track and monitor student progress on Codeforces. The system helps educators and mentors keep track of student activities, detect inactivity, and send automated reminders to encourage consistent practice.

## 🚀 Features

- **Student Management**
  - Add, edit, and delete student profiles
  - Store student details including name, email, phone, and Codeforces handle
  - Toggle email notification settings per student
  - Validation for email formats and phone numbers

- **Codeforces Integration**
  - Automatically sync student data from Codeforces
  - Track rating changes and contest participation
  - Record problem-solving history and statistics

- **Performance Analytics**
  - Interactive rating graphs to visualize progress
  - Problem-solving heatmaps showing activity patterns
  - Contest history with detailed performance metrics
  - Comprehensive problem-solving statistics

- **Inactivity Detection & Notifications**
  - Automatic detection of students inactive for 7+ days
  - Visual indicators for inactive students in the dashboard
  - Automated email reminders for inactive students
  - Tracking of reminder emails sent

- **Dashboard & UI**
  - Modern, responsive dashboard with student overview
  - Dark/Light theme support with persistent user preference
  - Loading states and error handling for better UX
  - Data export functionality for reports

- **Admin Features**
  - Secure authentication system for administrators
  - Configurable cron job settings for data synchronization
  - Manual sync triggers and status indicators
  - System health monitoring

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS with dark/light theme support
- **State Management**: React Context API
- **Data Visualization**: Chart.js, React-ChartJS-2
- **UI Components**: Custom components with Material UI integration
- **Icons & UI**: Lucide React, React Icons
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Scheduling**: Node-cron for automated tasks
- **External API**: Codeforces API integration
- **Email Service**: Nodemailer for automated notifications

## 📋 Prerequisites

- Node.js 14+ (recommended: 16+)
- MongoDB (local or Atlas)
- Codeforces API credentials (optional but recommended)
- SMTP email account for notifications

## 🔧 Installation & Setup

### Clone the repository
```bash
git clone https://github.com/Prasannakbhat123/CF-Tracker.git
cd CF-Tracker
```

### Install root dependencies
```bash
npm install
```

### Install server dependencies
```bash
cd server
npm install
```

### Install client dependencies
```bash
cd ../client
npm install
```

### Environment Configuration

Create a `.env` file in the server directory with the following variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Codeforces API (optional but recommended)
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

### Create Admin Account

Run the admin creation script:

```bash
cd server
node scripts/createAdmin.js
```

Follow the prompts to create your admin credentials.

### Start Development Servers

From the root directory:

```bash
# Start both server and client concurrently
npm run dev

# Or start them separately
npm run server   # Start server only
npm run client   # Start client only
```

- Backend server will run on http://localhost:5000
- Frontend client will run on http://localhost:3000

## 📱 Usage Guide

1. **Login to the Admin Dashboard**
   - Use the admin credentials created during setup
   - Navigate to the dashboard at http://localhost:3000/admin

2. **Add Students**
   - Click "Add Student" in the navbar
   - Fill in the student details including Codeforces handle
   - System will automatically sync the student's Codeforces data

3. **Monitor Student Progress**
   - View all students in the dashboard table
   - Click on a student to view detailed analytics
   - Check inactivity status indicated by warning badges

4. **Configure System Settings**
   - Adjust cron job schedule for automatic data sync
   - Monitor system status and sync health
   - Run manual syncs as needed

5. **Manage Notifications**
   - Toggle email notifications per student
   - View reminder count and history
   - Inactive students automatically receive reminder emails

## 🔍 Project Structure

```
CF-Tracker/
├── client/                 # Frontend Next.js application
│   ├── public/             # Static assets
│   └── src/
│       ├── app/            # Next.js app router pages
│       ├── components/     # React components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
│
├── server/                 # Backend Express server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── services/           # Business logic services
│   └── utils/              # Helper utilities
│
└── package.json            # Root package.json for dev scripts
```

## 📈 Future Enhancements

- Student self-registration portal
- Advanced analytics and reporting
- Group/batch management
- Customizable email templates
- Mobile app integration
- More coding platforms integration (LeetCode, HackerRank, etc.)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- [Prasanna K Bhat](https://github.com/Prasannakbhat123)

---

<p align="center">Made with ❤️ for competitive programming enthusiasts</p>
