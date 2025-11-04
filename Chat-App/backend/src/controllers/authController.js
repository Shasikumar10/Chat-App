const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const PasswordResetToken = require('../models/passwordResetToken');
const { signToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');

exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) return res.status(400).json({ error: 'Missing fields' });

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ email, passwordHash: hash, displayName });
    await user.save();

    const token = signToken({ id: user._id });
    res.json({ user: { id: user._id, displayName: user.displayName, email: user.email }, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user._id });
    res.json({ user: { id: user._id, displayName: user.displayName, email: user.email }, token });
  } catch (err) {
    next(err);
  }
};

exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ error: 'Authentication failed' });

    const token = signToken({ id: user._id });
    res.json({ user: { id: user._id, displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl }, token });
  } catch (err) {
    next(err);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await PasswordResetToken.deleteMany({ user: user._id });
    const pr = new PasswordResetToken({ user: user._id, tokenHash, expiresAt });
    await pr.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:19006'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, { resetUrl, token });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) return res.status(400).json({ error: 'token, email and newPassword required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid token or user' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await PasswordResetToken.findOne({ user: user._id, tokenHash });
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });
    if (record.expiresAt < new Date()) {
      await PasswordResetToken.deleteMany({ user: user._id });
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = hash;
    await user.save();

    await PasswordResetToken.deleteMany({ user: user._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
