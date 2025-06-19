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
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CODEFORCES_API_KEY=your_codeforces_api_key
CODEFORCES_API_SECRET=your_codeforces_api_secret
EMAIL_USER=your_email_for_notifications
EMAIL_PASS=your_email_password
```

4. Start the development servers
```
# Start server
cd server
npm run dev

# Start client
cd ../client
npm run dev
```

## Usage

1. Create an admin account using the script in server/scripts/createAdmin.js
2. Login with the admin credentials
3. Add students with their Codeforces handles
4. The system will automatically sync their data
5. Configure the sync settings as needed

## License

MIT
