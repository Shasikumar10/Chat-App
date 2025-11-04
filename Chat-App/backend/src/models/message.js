const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  encrypted: { type: Boolean, default: false },
  attachments: [{ url: String, type: String, filename: String }],
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  reactions: [{ emoji: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
