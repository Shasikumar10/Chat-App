# Chat-App

A full-stack real-time chat application built with React Native (Expo), Node.js/Express, Socket.io, and MongoDB Atlas.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - JWT-based auth with email/password and Google OAuth
- ✅ **Real-time Messaging** - Instant message delivery via Socket.io
- ✅ **1:1 and Group Chats** - Support for direct messages and group conversations
- ✅ **Message History** - Persistent storage in MongoDB with search functionality
- ✅ **Multimedia Support** - Share images, videos, audio, and documents
- ✅ **Push Notifications** - Expo push notifications for new messages
- ✅ **Presence Indicators** - Online/offline status and typing indicators
- ✅ **Read Receipts** - Message delivery and read tracking
- ✅ **Edit/Delete Messages** - Users can edit or delete their own messages
- ✅ **Reactions** - React to messages with emojis
- ✅ **Admin Moderation** - Admin tools to delete messages and ban users
- ✅ **Password Reset** - Secure token-based password recovery
- ✅ **Profile Management** - Customizable avatars, display names, and settings
- ✅ **Accessibility** - Adjustable font sizes and screen reader support
- ✅ **End-to-End Encryption** - Prototype encryption utilities (expandable)

## 📁 Project Structure

```
Chat-App/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Socket.io service
│   │   ├── utils/        # JWT, encryption, email utilities
│   │   ├── config/       # Passport Google OAuth config
│   │   └── app.js        # Express app setup
│   ├── server.js         # Server entry point
│   ├── package.json
│   └── README.md
│
└── mobile/               # React Native (Expo) mobile app
    ├── src/
    │   ├── screens/      # App screens (Login, Chat, Profile, Settings)
    │   ├── navigation/   # React Navigation setup
    │   ├── context/      # Auth context
    │   └── services/     # API and Socket.io client
    ├── App.js
    ├── package.json
    └── app.json
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io
- **Authentication**: JWT, Passport (Google OAuth)
- **File Uploads**: Multer
- **Security**: bcryptjs, crypto

### Frontend/Mobile
- **Framework**: React Native
- **Platform**: Expo Go
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios
- **Media**: Expo Image Picker, Document Picker
- **Notifications**: Expo Notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Expo CLI (`npm install -g expo-cli`)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Shasikumar10/Chat-App.git
cd Chat-App/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your values:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
JWT_SECRET=your_strong_secret_here
PORT=4000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:19006
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will run at `http://localhost:4000`

### Mobile App Setup

1. **Navigate to mobile folder**
```bash
cd ../mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Update API base URL**

Edit `src/services/api.js` and set your backend URL:
```javascript
const API_BASE_URL = 'http://your-backend-ip:4000/api';
```

4. **Start Expo**
```bash
npx expo start
```

5. **Run on device**
- Scan QR code with Expo Go app (iOS/Android)
- Or press `a` for Android emulator, `i` for iOS simulator

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

### Profile
- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update profile

### Chats
- `POST /api/chats` - Create chat
- `GET /api/chats` - List user's chats
- `GET /api/chats/:id` - Get chat details
- `POST /api/chats/:id/participants` - Add participant
- `DELETE /api/chats/:id/participants/:userId` - Remove participant

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/chat/:chatId` - Get messages for chat
- `PATCH /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/search?q=query` - Search messages
- `POST /api/messages/:id/delivered` - Mark delivered
- `POST /api/messages/:id/read` - Mark read
- `POST /api/messages/:id/reactions` - Add reaction
- `DELETE /api/messages/:id/reactions` - Remove reaction

### Uploads
- `POST /api/uploads/single` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:userId/ban` - Ban user
- `POST /api/admin/users/:userId/unban` - Unban user
- `DELETE /api/admin/messages/:messageId` - Delete any message

## 🔐 Security

- JWT tokens for authentication
- Passwords hashed with bcryptjs
- Password reset with secure tokens
- Input validation
- CORS enabled
- Encrypted message prototype (expandable to full E2E)

## 📱 Mobile App Screens

- **Login/Register** - User authentication
- **Chats List** - List of all conversations
- **Chat** - Real-time messaging with media support
- **Profile** - Edit avatar, display name
- **Settings** - Notifications, font size, logout

## 🌐 Socket.io Events

### Client → Server
- `join` - Join chat room
- `leave` - Leave chat room
- `typing` - Typing indicator
- `message` - Send message
- `read` - Mark message as read

### Server → Client
- `presence:update` - User online/offline
- `message:new` - New message received
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `message:delivered` - Message delivered
- `message:read` - Message read
- `message:reaction` - Reaction added
- `typing` - User typing

## 🚧 Future Enhancements

- [ ] Voice & Video Calls (WebRTC)
- [ ] Chatbots integration
- [ ] AI-powered smart replies
- [ ] Advanced E2E encryption
- [ ] Message threads
- [ ] File preview
- [ ] Dark mode
- [ ] Unit & integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Shasikumar10

## 🙏 Acknowledgments

Built with ❤️ using modern technologies and best practices for scalable real-time applications.

---

**Repository**: https://github.com/Shasikumar10/Chat-App

For questions or issues, please open an issue on GitHub.
