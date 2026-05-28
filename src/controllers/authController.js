const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Dynamic UPI Generation (Example: amit954@phonepe)
    const sanitizedName = name.replace(/\s/g, '').toLowerCase();
    const upiId = `${sanitizedName}${Math.floor(Math.random() * 10000)}@phonepe`;

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      upiId, // New Feature
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        user: user,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'user not found' });
    }
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      status: 'success',
      user: user,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -mpin');
    if (user) {
      const responseUser = user.toObject();
      responseUser.hasMpinSet = !!req.user.mpin;
      res.json({
        user: responseUser,
        status: 'success',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    if (users && users.length > 0) {
      res.status(200).json({
        status: 'success',
        users: users,
      });
    } else {
      res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Set or Change 4-digit MPIN
// @route   POST /api/auth/setup-mpin
// @access  Private
const setupMpin = async (req, res) => {
  try {
    const { mpin } = req.body; // Expecting a 4 or 6 digit string

    if (!mpin || mpin.length < 4) {
      return res.status(400).json({ message: 'Please provide a valid MPIN (at least 4 digits)' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedMpin = await bcrypt.hash(mpin.toString(), salt);
    const user = await User.findById(req.user._id);
    user.mpin = hashedMpin;
    await user.save();
    res.json({
      status: 'success',
      message: 'MPIN setup successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const profileUpdate = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const logout = async (req, res) => {

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }
  try {
    // Here we just return a success message, as JWTs are stateless and can't be truly "logged out" without a blacklist
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}

// mpin login is handled in a separate route and controller for better separation of concerns,
//  and it will verify the MPIN against the hashed value stored in the database.
//  This allows users to log in using their MPIN after they have set it up,
//  providing an additional layer of security and convenience.

const loginWithMpin = async (req, res) => {
  try {
    const { phone, mpin } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phone });

    if (!user || !user.mpin) {
      return res.status(401).json({
        message: 'MPIN not set up for this user',
      });
    }

    // Compare MPIN
    const isMatch = await bcrypt.compare(
      mpin.toString(),
      user.mpin
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid MPIN',
      });
    }

    res.json({
      message: 'Login successful',
      status: 'success',
      user: user,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, setupMpin, profileUpdate, logout, loginWithMpin, getAllUser };
