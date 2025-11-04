const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/jwt');
const User = require('../models/user');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/', authenticate, async (req, res, next) => {
  try {
    const updates = {};
    const { displayName, avatarUrl, settings } = req.body;
    if (displayName) updates.displayName = displayName;
    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (settings) updates.settings = settings;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Register push notification token
const { registerPushToken } = require('../controllers/notificationController');
router.post('/push-token', authenticate, registerPushToken);

module.exports = router;
