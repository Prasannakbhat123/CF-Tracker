require('dotenv').config();
const mongoose = require('mongoose');
const { createAdminScript } = require('../controllers/authController');

// Admin data
const adminData = {
  username: 'admin',  // Change this
  password: 'password123',  // Change this
  email: 'admin@example.com'  // Change this
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  // Create admin
  const result = await createAdminScript(adminData);
  console.log(result);
  
  // Disconnect
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
