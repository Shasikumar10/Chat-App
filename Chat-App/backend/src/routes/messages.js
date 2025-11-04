const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../utils/jwt');

router.post('/', authenticate, messageController.createMessage);
router.get('/chat/:chatId', authenticate, messageController.getMessagesForChat);
router.patch('/:id', authenticate, messageController.editMessage);
router.delete('/:id', authenticate, messageController.deleteMessage);
router.get('/search', authenticate, messageController.searchMessages);

// Delivery/read receipts
router.post('/:id/delivered', authenticate, messageController.markDelivered);
router.post('/:id/read', authenticate, messageController.markRead);

// Reactions
router.post('/:id/reactions', authenticate, messageController.addReaction);
router.delete('/:id/reactions', authenticate, messageController.removeReaction);

module.exports = router;
