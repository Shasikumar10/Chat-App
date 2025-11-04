const User = require('../models/user');

// Register/update push token for user
exports.registerPushToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.pushToken = token;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Send push notification (stub - integrate with Expo Push or FCM)
async function sendPushNotification(userId, notification) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushToken) return;

    // TODO: Integrate with Expo Push Notifications or FCM
    // For Expo:
    // const { Expo } = require('expo-server-sdk');
    // const expo = new Expo();
    // const messages = [{
    //   to: user.pushToken,
    //   sound: 'default',
    //   title: notification.title,
    //   body: notification.body,
    //   data: notification.data
    // }];
    // await expo.sendPushNotificationsAsync(messages);

    console.log(`[PUSH] Would send to ${user.email}: ${notification.title} - ${notification.body}`);
  } catch (err) {
    console.error('Push notification error:', err);
  }
}

module.exports = { 
  registerPushToken: exports.registerPushToken, 
  sendPushNotification 
};
