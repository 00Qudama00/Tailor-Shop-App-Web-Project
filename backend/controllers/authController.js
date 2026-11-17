const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SuitType = require('../models/SuitType');
const sendOtpEmail = require('../utils/email');

const DEFAULT_SUIT_TYPES = [
  { name: 'Simple', price: 1500, employeeSalary: 500 },
  { name: 'Design', price: 2000, employeeSalary: 700 },
  { name: 'Double Silai', price: 1800, employeeSalary: 600 },
  { name: 'Triple Silai', price: 2200, employeeSalary: 800 },
  { name: 'Waist Coat', price: 3000, employeeSalary: 1000 },
  { name: 'Karhai Design', price: 3500, employeeSalary: 1200 },
];

function createToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function giveNewOtp(user, purpose) {
  const otp = makeOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOtpEmail(user.email, otp, purpose);
}

function otpIsValid(user, otp) {
  return user.otp && user.otp === String(otp).trim() && user.otpExpires > new Date();
}

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password: hashed });

  const suitTypes = DEFAULT_SUIT_TYPES.map((s) => ({ ...s, user: user._id, isDefault: true }));
  await SuitType.insertMany(suitTypes);

  await giveNewOtp(user, 'verify');
  res.status(201).json({ message: 'Account created. We sent a 6 digit code to your email.' });
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !otpIsValid(user, otp)) {
    return res.status(400).json({ message: 'Invalid or expired code.' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ message: 'Email verified.', token: createToken(user), user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(400).json({ message: 'Wrong email or password.' });
  }

  if (!user.isVerified) {
    await giveNewOtp(user, 'verify');
    return res.status(403).json({
      message: 'Please verify your email. A new code has been sent.',
      needsVerification: true,
    });
  }

  res.json({ token: createToken(user), user });
};

exports.resendOtp = async (req, res) => {
  const { email, purpose } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }
  await giveNewOtp(user, purpose === 'reset' ? 'reset' : 'verify');
  res.json({ message: 'A new code has been sent.' });
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }
  await giveNewOtp(user, 'reset');
  res.json({ message: 'Reset code sent to your email.' });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !otpIsValid(user, otp)) {
    return res.status(400).json({ message: 'Invalid or expired code.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ message: 'Password changed. You can login now.' });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json(user);
};

exports.updateShop = async (req, res) => {
  const user = await User.findById(req.userId);
  const { name, phone, shopName, shopPhone, shopAddress } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (shopName) user.shopName = shopName;
  if (shopPhone !== undefined) user.shopPhone = shopPhone;
  if (shopAddress !== undefined) user.shopAddress = shopAddress;
  if (req.file) user.logo = '/uploads/' + req.file.filename;

  await user.save();
  res.json(user);
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);

  if (!(await bcrypt.compare(currentPassword || '', user.password))) {
    return res.status(400).json({ message: 'Current password is wrong.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated.' });
};
