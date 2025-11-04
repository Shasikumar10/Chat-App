const Chat = require('../models/chat');

exports.createChat = async (req, res, next) => {
  try {
    const { type = 'direct', name, participants = [] } = req.body;
    const creator = req.user.id;
    if (!participants.includes(creator)) participants.push(creator);

    const chat = new Chat({ type, name: name || null, participants, admins: [creator] });
    await chat.save();
    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

exports.listChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId }).populate('lastMessage').sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (err) {
    next(err);
  }
};

exports.getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('participants', 'displayName avatarUrl');
    if (!chat) return res.status(404).json({ error: 'Not found' });
    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

exports.addParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ error: 'Not found' });
    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId);
      await chat.save();
    }
    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ error: 'Not found' });
    chat.participants = chat.participants.filter(p => p.toString() !== userId);
    await chat.save();
    res.json({ chat });
  } catch (err) {
    next(err);
  }
};
