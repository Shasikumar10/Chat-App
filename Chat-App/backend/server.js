require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const initSocket = require('./src/services/socket');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO || process.env.MONGO_ATLAS || process.env.MONGOURL;
    if (!mongoUri) {
      console.warn('MONGO_URI not set. Please set it in .env');
    }
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/chatapp');
    console.log('Connected to MongoDB');

    const server = http.createServer(app);
    const io = initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
