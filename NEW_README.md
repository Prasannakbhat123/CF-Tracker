# Codeforces Tracker

An application to track and monitor student progress on Codeforces.

## Features

- **Student Management**: Add, edit, and manage student profiles
- **Codeforces Integration**: Automatically sync student data from Codeforces
- **Performance Tracking**: Track student ratings, problems solved, and contest history
- **Data Visualization**: View progress through interactive charts and graphs
- **Inactivity Detection**: Get notified when students are inactive for 7+ days
- **Email Notifications**: Automatic reminder emails for inactive students
- **Dark/Light Theme**: Support for both dark and light themes

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT based auth

## Setup

### Prerequisites
- Node.js 14+
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/Prasannakbhat123/CF-Tracker.git
cd CF-Tracker
```

2. Install dependencies
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
- Create a `.env` file in the server directory
- Add the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CODEFORCES_API_KEY=your_codeforces_api_key
CODEFORCES_API_SECRET=your_codeforces_api_secret
EMAIL_USER=your_email_for_notifications
EMAIL_PASS=your_email_password_or_app_password
```

4. Start the application
```
# Start the server (from server directory)
npm start

# Start the client (from client directory)
npm run dev
```

## Usage

### Admin Setup
1. Run the admin creation script to create your first admin user:
```
cd server
node scripts/createAdmin.js
```

2. Log in with the created admin credentials

### Adding Students
1. Navigate to the dashboard
2. Click "Add Student"
3. Fill in the student details including Codeforces handle
4. Save to automatically sync the student's Codeforces data

### Monitoring Progress
- View individual student profiles to see detailed performance
- Track rating changes, problem solving history, and contest participation
- Use the inactivity monitoring to identify students who haven't been active

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
