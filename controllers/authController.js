import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

// @desc    Register a new user (customer or service professional)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Determine target role ('professional' for service providers, default 'customer')
    const userRole = (role === 'professional' || role === 'partner' || role === 'pro') ? 'professional' : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: userRole,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: `${userRole === 'professional' ? 'Service Partner' : 'Customer'} registered successfully`,
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAvailable: user.isAvailable ?? true,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAvailable: user.isAvailable ?? true,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};

// @desc    Toggle professional availability status (Ready for Work / Offline)
// @route   PUT /api/auth/availability
// @access  Private (Professional only)
export const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.body.isAvailable !== undefined) {
      user.isAvailable = Boolean(req.body.isAvailable);
    } else {
      user.isAvailable = !user.isAvailable;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Availability status updated to ${user.isAvailable ? 'Ready for Work' : 'Offline'}`,
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAvailable: user.isAvailable,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('toggleAvailability error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error toggling availability',
    });
  }
};
