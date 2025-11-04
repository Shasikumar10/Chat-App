# Chat-App Backend (Express + Socket.io + MongoDB)

Real-time chat application backend using Node.js, Express, Socket.io and MongoDB Atlas.

## Features
- User registration/login with JWT authentication
- Google OAuth support (passport)
- Password reset flow with secure token generation
- Real-time messaging via Socket.io (join/leave, typing, read receipts, presence)
- REST APIs for chats and messages
- Message search, edit, delete
- Profile management
- Placeholder E2E encryption utility
- File upload support (multer installed)

## Getting Started

1. **Copy `.env.example` to `.env`** and fill in your values:
```
MONGO_URI=mongodb+srv://Shasi:Shasi@cluster0.9pknbdd.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_here
PORT=4000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
CLIENT_URL=http://localhost:19006
```

2. **Install dependencies:**
```powershell
cd backend
npm install
```

3. **Start server in dev mode:**
```powershell
npm run dev
```

Server runs at `http://localhost:4000`

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/google` - Google OAuth redirect
- GET `/api/auth/google/callback` - OAuth callback
- POST `/api/auth/password-reset/request` - Request password reset
- POST `/api/auth/password-reset/confirm` - Confirm password reset

### Profile
- GET `/api/profile` - Get current user profile (requires auth)
- PATCH `/api/profile` - Update profile (requires auth)

### Chats
- POST `/api/chats` - Create chat (requires auth)
- GET `/api/chats` - List user's chats (requires auth)
- GET `/api/chats/:id` - Get chat details (requires auth)
- POST `/api/chats/:id/participants` - Add participant (requires auth)
- DELETE `/api/chats/:id/participants/:userId` - Remove participant (requires auth)

### Messages
- POST `/api/messages` - Create message (requires auth)
- GET `/api/messages/chat/:chatId` - Get messages for chat (requires auth)
- PATCH `/api/messages/:id` - Edit message (requires auth)
- DELETE `/api/messages/:id` - Delete message (requires auth)
- GET `/api/messages/search?q=query` - Search messages (requires auth)

## Socket.io Events

### Client emits:
- `join` - Join chat room: `{ chatId, userId }`
- `leave` - Leave chat room: `{ chatId, userId }`
- `typing` - Typing indicator: `{ chatId, userId, typing }`
- `message` - Send message: `{ chat, content, ... }`
- `read` - Mark message read: `{ chatId, messageId, userId }`

### Server emits:
- `presence:update` - User online/offline: `{ userId, online }`
- `message:new` - New message in chat
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `typing` - Typing indicator broadcast
- `message:read` - Read receipt broadcast

## Security Notes
- Never commit `.env` or credentials to git
- The encryption helper is a demo; implement proper E2E encryption with client-side key management
- Use strong JWT_SECRET in production
- Enable HTTPS in production

## Next Steps (Planned)
- File upload endpoints (multer configured)
- Push notifications (FCM/APNs)
- Admin moderation tools
- Tests and CI/CD
- Rate limiting
- Real email provider integration for password reset

## Contributing
Push to: https://github.com/Shasikumar10/Chat-App.git
