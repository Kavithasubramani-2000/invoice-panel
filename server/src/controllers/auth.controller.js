const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, company, address, taxId, logo } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (logo !== undefined) updateData.logo = logo;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, me, updateProfile };
