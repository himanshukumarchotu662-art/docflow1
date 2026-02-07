const User = require('../Models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student',
      department: role === 'approver' ? department : null,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      age: user.age,
      profilePhoto: user.profilePhoto,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      age: user.age,
      profilePhoto: user.profilePhoto,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('--- Profile Update Request ---');
    console.log('User ID:', req.user?.id);
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No file uploaded');

    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      console.log('User found in DB:', user.username);
      user.username = username || user.username;
      user.email = email || user.email;
      if (req.body.age !== undefined) user.age = req.body.age;
      if (password) {
        console.log('Updating user password');
        user.password = password;
      }
      
      // Handle file upload for profile photo
      if (req.file) {
        user.profilePhoto = `/uploads/${req.file.filename}`;
      } else if (req.body.profilePhoto !== undefined) {
        user.profilePhoto = req.body.profilePhoto;
      }

      const updatedUser = await user.save();
      console.log('Profile saved successfully for user:', updatedUser.username);

      const token = generateToken(updatedUser._id);
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        age: updatedUser.age,
        profilePhoto: updatedUser.profilePhoto,
        token: token,
      });
    } else {
      console.log('User not found for ID:', req.user.id);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile update catch block:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};