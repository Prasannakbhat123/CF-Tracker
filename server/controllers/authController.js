const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Login admin user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    // Return token and admin info
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify token and get current admin
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create script to add an admin (for direct DB insertion)
exports.createAdminScript = async (adminData) => {
  try {
    const { username, password, email } = adminData;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log('Admin already exists');
      return { success: false, message: 'Admin already exists' };
    }
    
    // Create new admin
    const admin = new Admin({
      username,
      password,
      email
    });
    
    await admin.save();
    console.log('Admin created successfully');
    return { success: true, message: 'Admin created successfully' };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, message: error.message };
  }
};
