const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered. Please log in.', 400));
    }

    const newUser = await User.create({ name, email, password });
    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: { id: user._id, name: user.name, email: user.email }
      }
    });
  } catch (err) {
    next(err);
  }
};
