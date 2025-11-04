const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profile');
// passport for social auth
const passport = require('passport');
require('./config/passport');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', (req, res) => res.json({ ok: true, message: 'Chat-App Backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);

const uploadRoutes = require('./routes/uploads');
app.use('/api/uploads', uploadRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
