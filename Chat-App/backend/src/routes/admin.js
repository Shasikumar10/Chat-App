const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../utils/jwt');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminController.requireAdmin);

router.get('/users', adminController.listUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.delete('/messages/:messageId', adminController.deleteMessage);

module.exports = router;
