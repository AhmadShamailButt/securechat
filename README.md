#  SecureChat - End-to-End Encrypted Real-Time Messaging

A privacy-focused, real-time messaging web application with **end-to-end encryption**, secure authentication, and modern chat features.

[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4+-010101.svg?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

##  Overview

**SecureChat** is a modern, privacy-first messaging platform that implements **client-side end-to-end encryption**, ensuring that only you and your intended recipients can read your messages. Not even the server can decrypt your conversations.

### Key Principles

-  **Privacy First**: End-to-end encryption with keys never leaving your device
-  **Real-Time**: Instant message delivery using WebSockets
-  **Secure by Design**: JWT authentication, encrypted storage, secure protocols
-  **Web-Based**: No installation required, works across all modern browsers
-  **Feature-Rich**: Direct messages, chat rooms, typing indicators, read receipts

---

##  Features

###  Security Features

- **End-to-End Encryption (E2EE)**
  - Client-side encryption using AES-256-GCM
  - RSA-2048 for key exchange
  - Messages encrypted before transmission
  - Zero-knowledge architecture (server cannot decrypt messages)

- **Secure Authentication**
  - JWT-based authentication with refresh tokens
  - Bcrypt password hashing (10+ rounds)
  - Secure session management
  - Protected routes and API endpoints

- **Data Protection**
  - Encrypted message storage
  - Secure key management
  - HTTPS-only communication (production)
  - XSS and CSRF protection

###  Chat Features

- **Real-Time Messaging**
  - Instant message delivery via WebSockets
  - Typing indicators
  - Online/offline status
  - Read receipts
  - Message timestamps

- **Chat Organization**
  - Direct messaging (1-on-1)
  - Group chat rooms
  - User presence tracking
  - Chat history
  - Search functionality

- **User Experience**
  - Modern, responsive UI
  - Dark/light mode support
  - Emoji support
  - File sharing (planned)
  - Notifications

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Socket.io** | Real-time bidirectional communication |
| **MongoDB** | Database (message & user storage) |
| **Mongoose** | ODM (Object Data Modeling) |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Crypto** | Encryption utilities |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Context API** | State management |
| **Socket.io Client** | WebSocket client |
| **Web Crypto API** | Browser-native encryption |
| **React Router** | Client-side routing |
| **CSS3** | Styling |

---

##  Architecture

### Security Architecture

```
┌─────────────┐                           ┌─────────────┐
│   Client A  │                           │   Client B  │
│             │                           │             │
│  [Private   │                           │  [Private   │
│   Key A]    │                           │   Key B]    │
│             │                           │             │
│  Encrypt    │                           │  Decrypt    │
│  with       │     ┌──────────────┐     │  with       │
│  Public B   │────▶│    Server    │────▶│  Private B  │
│             │     │              │     │             │
│             │     │ [Encrypted   │     │             │
│             │     │  Messages]   │     │             │
│             │     │              │     │             │
│             │     │  Cannot      │     │             │
│             │     │  Decrypt!    │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

### System Flow

1. **User Registration**
   ```
   Client → Generate Key Pair → Store Private Key Locally
        → Send Public Key to Server → Server Stores Public Key
   ```

2. **Message Sending**
   ```
   Compose Message → Encrypt with Recipient's Public Key
        → Send Encrypted Message → Server Stores & Forwards
        → Recipient Decrypts with Private Key
   ```

3. **Real-Time Updates**
   ```
   WebSocket Connection → JWT Authentication
        → Subscribe to Channels → Receive Real-Time Events
   ```

---

## 📁 Project Structure

```
SecureChat/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── jwt.js               # JWT configuration
│   │   │   └── socket.js            # Socket.io setup
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth logic
│   │   │   ├── messageController.js # Message handling
│   │   │   └── userController.js    # User management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── socketAuthMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── Message.js           # Message schema
│   │   │   └── Room.js              # Room schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   ├── messageRoutes.js     # Message endpoints
│   │   │   └── userRoutes.js        # User endpoints
│   │   ├── services/
│   │   │   ├── authService.js       # Auth business logic
│   │   │   ├── cryptoService.js     # Encryption utilities
│   │   │   └── socketService.js     # Socket event handlers
│   │   └── utils/
│   │       ├── helpers.js           # Helper functions
│   │       ├── logger.js            # Logging utility
│   │       └── validators.js        # Input validation
│   ├── tests/                        # Test files
│   ├── .gitignore
│   ├── package.json
│   └── server.js                     # Entry point
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── AuthForm.css
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   ├── UserList.jsx
│   │   │   │   └── Chat.css
│   │   │   ├── Common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Modal.jsx
│   │   │   └── Layout/
│   │   │       ├── Layout.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # Auth state
│   │   │   ├── CryptoContext.jsx    # Encryption context
│   │   │   └── SocketContext.jsx    # WebSocket context
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   ├── useCrypto.js
│   │   │   └── useSocket.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── services/
│   │   │   ├── api.js               # API client
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── cryptoService.js     # Encryption logic
│   │   │   └── socketService.js     # Socket handlers
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── crypto.js            # Crypto utilities
│   │   │   ├── helpers.js
│   │   │   └── storage.js           # Local storage wrapper
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

##  Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **MongoDB** 6+ (local or Atlas)
- Modern web browser with Web Crypto API support

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/SecureChat.git
cd SecureChat
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env`:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/securechat
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securechat

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173
```

**Start the backend:**

```bash
npm run dev
# or for production:
npm start
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env`:**

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Start the frontend:**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

##  Usage

### 1. Register a New Account

1. Navigate to `http://localhost:5173`
2. Click **"Register"**
3. Enter username, email, and password
4. System automatically generates encryption keys
5. Public key sent to server, private key stored locally

### 2. Login

1. Enter credentials
2. System retrieves your private key from local storage
3. JWT token issued for authentication

### 3. Start Chatting

1. Select a user from the user list
2. Type your message in the input field
3. Message encrypted with recipient's public key
4. Encrypted message sent to server
5. Recipient decrypts with their private key

### 4. Create or Join Rooms

1. Click **"Create Room"** button
2. Enter room name
3. Invite users or share room ID
4. All room messages are encrypted

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes |
| PUT | `/api/users/:id` | Update user profile | Yes |
| GET | `/api/users/:id/public-key` | Get user's public key | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages` | Get user's messages | Yes |
| GET | `/api/messages/:roomId` | Get room messages | Yes |
| POST | `/api/messages` | Send message | Yes |
| DELETE | `/api/messages/:id` | Delete message | Yes |

### Rooms

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rooms` | Get all rooms | Yes |
| POST | `/api/rooms` | Create new room | Yes |
| GET | `/api/rooms/:id` | Get room details | Yes |
| PUT | `/api/rooms/:id` | Update room | Yes |
| DELETE | `/api/rooms/:id` | Delete room | Yes |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join_room` | `{ roomId }` | Join a chat room |
| `leave_room` | `{ roomId }` | Leave a chat room |
| `send_message` | `{ roomId, encryptedMessage, recipientId }` | Send encrypted message |
| `typing_start` | `{ roomId }` | User started typing |
| `typing_stop` | `{ roomId }` | User stopped typing |
| `message_read` | `{ messageId }` | Mark message as read |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `message_received` | `{ message }` | New encrypted message |
| `user_joined` | `{ userId, roomId }` | User joined room |
| `user_left` | `{ userId, roomId }` | User left room |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `typing` | `{ userId, roomId }` | User is typing |
| `message_read` | `{ messageId, userId }` | Message was read |

---

##  Encryption Details

### Key Generation

```javascript
// RSA-2048 key pair generation
const keyPair = await crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["encrypt", "decrypt"]
);
```

### Message Encryption Flow

```javascript
// 1. Generate random AES key for this message
const aesKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

// 2. Encrypt message with AES key
const encryptedMessage = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: randomIV },
  aesKey,
  messageBuffer
);

// 3. Encrypt AES key with recipient's RSA public key
const encryptedKey = await crypto.subtle.encrypt(
  { name: "RSA-OAEP" },
  recipientPublicKey,
  aesKeyBuffer
);

// 4. Send both to server
sendToServer({
  encryptedMessage,
  encryptedKey,
  iv
});
```

### Decryption Flow

```javascript
// 1. Decrypt AES key with private RSA key
const aesKey = await crypto.subtle.decrypt(
  { name: "RSA-OAEP" },
  privateKey,
  encryptedKey
);

// 2. Decrypt message with AES key
const decryptedMessage = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv: receivedIV },
  aesKey,
  encryptedMessage
);
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- messageController.test.js
```

### Frontend Tests

```bash
cd frontend
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# From root directory
npm run test:integration
```

---

## 🚢 Deployment

### Using Docker

**Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/securechat
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

**Deploy:**

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set strong `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Configure CORS properly
- [ ] Set up MongoDB Atlas or managed database
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure environment variables securely
- [ ] Set `NODE_ENV=production`
- [ ] Implement backup strategy
- [ ] Set up CDN for frontend assets

---

## 🔒 Security Best Practices

### Implemented Security Measures

✅ **End-to-End Encryption**
- Client-side encryption/decryption only
- Private keys never leave the device
- Server cannot decrypt messages

✅ **Secure Authentication**
- JWT with short expiration times
- Refresh token rotation
- Secure password hashing (bcrypt)

✅ **Data Protection**
- Input validation and sanitization
- SQL injection prevention (using Mongoose)
- XSS protection
- CSRF tokens

✅ **Transport Security**
- HTTPS enforcement in production
- Secure WebSocket connections (WSS)
- CORS configuration

✅ **Key Management**
- Keys stored in browser's IndexedDB
- Automatic key rotation (optional)
- Secure key backup mechanism

### Recommendations

🔹 **For Users:**
- Use strong, unique passwords
- Enable two-factor authentication (if implemented)
- Backup your encryption keys
- Use on trusted devices only
- Log out after each session on shared devices

🔹 **For Developers:**
- Regular security audits
- Keep dependencies updated
- Monitor for vulnerabilities
- Implement rate limiting
- Use security headers (Helmet.js)
- Enable logging and monitoring

---

## 🛠️ Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Code Quality

**Linting:**
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

**Formatting:**
```bash
npm run format
```

---

##  Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all tests pass**
   ```bash
   npm test
   ```
6. **Commit with meaningful message**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Keep functions small and focused
- Write tests for new features

---

## 📋 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] End-to-end encryption
- [x] Real-time messaging
- [x] Direct messaging
- [x] Chat rooms
- [x] User presence

### Phase 2: Enhancements 🚧
- [ ] File sharing (encrypted)
- [ ] Voice messages
- [ ] Video calls (WebRTC)
- [ ] Group management
- [ ] Message search
- [ ] Emoji reactions

### Phase 3: Advanced Features 📅
- [ ] Two-factor authentication
- [ ] Desktop application (Electron)
- [ ] Mobile apps (React Native)
- [ ] Message backup/export
- [ ] Advanced admin panel
- [ ] Analytics dashboard

---

## 🐛 Known Issues

- Message history limited to 100 messages per room (performance)
- Large file uploads not yet supported
- Safari browser may have WebCrypto limitations
- Mobile responsiveness needs improvement

See [Issues](https://github.com/YOUR-USERNAME/SecureChat/issues) for complete list.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

**Manal Bukhari**
- GitHub: [@Manal-Bukhari](https://github.com/Manal-Bukhari)
- Email: manal.bukhari@nu.edu.pk
- University: FAST-NUCES Lahore

---

## 🙏 Acknowledgments

- **Socket.io** team for real-time communication tools
- **Web Crypto API** for browser-native encryption
- **MongoDB** for flexible data storage
- **React** community for frontend ecosystem
- **FAST-NUCES** for academic support

---

## 📚 References

- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Socket.io Documentation](https://socket.io/docs/)
- [End-to-End Encryption Explained](https://signal.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/)

---

##  Support

For questions, issues, or feature requests:
- **GitHub Issues**: [SecureChat Issues](https://github.com/YOUR-USERNAME/SecureChat/issues)
- **Email**: manal.bukhari@nu.edu.pk

---

## ⚠️ Disclaimer

This application is provided for educational purposes. While it implements industry-standard encryption, it has not undergone a professional security audit. For production use with sensitive data, please conduct a thorough security review.

---

##  Show Your Support

Give a ⭐️ if you believe in privacy-first communication!

---


*End-to-end encrypted. Zero knowledge. Your messages, your privacy.* 🛡️
