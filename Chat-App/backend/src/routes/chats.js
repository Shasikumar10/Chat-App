const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../utils/jwt');

router.post('/', authenticate, chatController.createChat);
router.get('/', authenticate, chatController.listChats);
router.get('/:id', authenticate, chatController.getChat);
router.post('/:id/participants', authenticate, chatController.addParticipant);
router.delete('/:id/participants/:userId', authenticate, chatController.removeParticipant);

module.exports = router;
