const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  avatarUrl: { type: String },
  googleId: { type: String },
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date },
  pushToken: { type: String },
  settings: {
    notifications: { type: Boolean, default: true },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
