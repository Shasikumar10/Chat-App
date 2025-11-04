const Message = require('../models/message');
const Chat = require('../models/chat');
const User = require('../models/user');
const { getIo } = require('../services/socket');
const { sendPushNotification } = require('./notificationController');

exports.createMessage = async (req, res, next) => {
  try {
    const { chat: chatId, content, attachments = [], encrypted = false } = req.body;
    const sender = req.user.id;
    if (!chatId) return res.status(400).json({ error: 'chat is required' });

    const message = new Message({ chat: chatId, sender, content, attachments, encrypted });
    await message.save();

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id }, { new: true });

    const io = getIo();
    if (io) io.to(chatId.toString()).emit('message:new', message);

    // Send push notifications to offline participants
    const chat = await Chat.findById(chatId).populate('participants');
    const senderUser = await User.findById(sender);
    if (chat && senderUser) {
      for (const participant of chat.participants) {
        if (participant._id.toString() !== sender && !participant.online && participant.pushToken) {
          await sendPushNotification(participant._id, {
            title: senderUser.displayName || 'New message',
            body: content || 'Sent you a message',
            data: { chatId, messageId: message._id }
          });
        }
      }
    }

    res.json({ message });
  } catch (err) {
    next(err);
  }
};

exports.getMessagesForChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;
    const query = { chat: chatId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).populate('sender', 'displayName avatarUrl');
    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

exports.editMessage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { content } = req.body;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.sender.toString() !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

    msg.content = content;
    msg.edited = true;
    await msg.save();

    const io = getIo();
    if (io) io.to(msg.chat.toString()).emit('message:edited', msg);

    res.json({ message: msg });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.sender.toString() !== req.user.id && !req.user.isAdmin) return res.status(403).json({ error: 'Not allowed' });

    msg.deleted = true;
    await msg.save();

    const io = getIo();
    if (io) io.to(msg.chat.toString()).emit('message:deleted', { id: msg._id });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.searchMessages = async (req, res, next) => {
  try {
    const { q, limit = 50 } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });

    const messages = await Message.find({ content: { $regex: q, $options: 'i' } }).limit(parseInt(limit)).populate('sender', 'displayName avatarUrl');
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// Mark message as delivered to user
exports.markDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (!msg.deliveredTo.includes(userId)) {
      msg.deliveredTo.push(userId);
      await msg.save();
    }

    const io = require('../services/socket').getIo();
    if (io) io.to(msg.chat.toString()).emit('message:delivered', { messageId: id, userId });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Mark message as read by user
exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (!msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      await msg.save();
    }

    const io = require('../services/socket').getIo();
    if (io) io.to(msg.chat.toString()).emit('message:read', { messageId: id, userId });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Add reaction to message
exports.addReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    if (!emoji) return res.status(400).json({ error: 'emoji required' });

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    // Remove existing reaction from this user for this emoji
    msg.reactions = msg.reactions.filter(r => !(r.user.toString() === userId && r.emoji === emoji));
    // Add new reaction
    msg.reactions.push({ emoji, user: userId });
    await msg.save();

    const io = require('../services/socket').getIo();
    if (io) io.to(msg.chat.toString()).emit('message:reaction', { messageId: id, userId, emoji });

    res.json({ message: msg });
  } catch (err) {
    next(err);
  }
};

// Remove reaction from message
exports.removeReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    if (!emoji) return res.status(400).json({ error: 'emoji required' });

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    msg.reactions = msg.reactions.filter(r => !(r.user.toString() === userId && r.emoji === emoji));
    await msg.save();

    const io = require('../services/socket').getIo();
    if (io) io.to(msg.chat.toString()).emit('message:reaction:remove', { messageId: id, userId, emoji });

    res.json({ message: msg });
  } catch (err) {
    next(err);
  }
};
