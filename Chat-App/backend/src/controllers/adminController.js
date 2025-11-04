const User = require('../models/user');
const Message = require('../models/message');

// Middleware to check if user is admin
exports.requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Ban user
exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.banned = true;
    await user.save();

    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};

// Unban user
exports.unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.banned = false;
    await user.save();

    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};

// Delete any message (admin override)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    msg.deleted = true;
    msg.content = '[deleted by admin]';
    await msg.save();

    const io = require('../services/socket').getIo();
    if (io) io.to(msg.chat.toString()).emit('message:deleted', { id: msg._id, byAdmin: true });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin list)
exports.listUsers = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    const users = await User.find().select('-passwordHash').limit(parseInt(limit)).skip(parseInt(skip));
    const total = await User.countDocuments();
    res.json({ users, total });
  } catch (err) {
    next(err);
  }
};
