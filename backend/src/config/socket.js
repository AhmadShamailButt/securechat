const socketIo = require("socket.io");
const User = require("../models/User");
const mongoose = require("mongoose");
const { isConnected } = require("./database");
let io;

exports.init = (server, corsOptions) => {
  io = socketIo(server, { 
    cors: corsOptions || { origin: "*", methods: ["GET", "POST"], credentials: true },
    transports: ['websocket','polling'],
    pingTimeout: 30000,
    pingInterval: 10000
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Track which rooms this socket has joined
    const joinedRooms = new Set();
    // Track socket's user identifier
    let socketUser = null;

    // Handle user online status
    socket.on("userOnline", async (data) => {
      const userId = data.userId;
      if (!userId) return;

      // Wait for MongoDB connection with retry
      const updateUserStatus = async (retries = 5) => {
        if (isConnected() || mongoose.connection.readyState === 1) {
          try {
            // Update user's online status
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastSeen: new Date()
            });

            // Notify all other users that this user is now online
            socket.broadcast.emit("userStatusChanged", {
              userId: userId,
              isOnline: true,
              lastSeen: new Date()
            });

            console.log(`User ${userId} is now online`);
          } catch (error) {
            console.error("Error updating user online status:", error);
          }
        } else if (retries > 0) {
          // Retry after 500ms if MongoDB is not connected yet
          setTimeout(() => updateUserStatus(retries - 1), 500);
        } else {
          console.log("MongoDB not connected after retries, skipping user online status update");
        }
      };

      updateUserStatus();
    });

    socket.on("join", (data) => {
      // Handle joining with user information
      const conversationId = data.conversationId || data;
      const userId = data.userId || null;
      
      // Handle sample- prefix if still present in frontend
      const roomId = conversationId.startsWith('sample-') 
        ? conversationId.replace('sample-', '') 
        : conversationId;
        
      console.log(`Socket ${socket.id} joining room ${roomId}`);
      
      // Store user identifier if provided
      if (userId) {
        socketUser = userId;
        console.log(`Socket ${socket.id} associated with user ${userId}`);
        
        // Mark user as online when they join (with retry if MongoDB not ready)
        const updateStatusOnJoin = async (retries = 5) => {
          if (isConnected() || mongoose.connection.readyState === 1) {
            try {
              await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: new Date()
              });
              
              // Notify all other users
              socket.broadcast.emit("userStatusChanged", {
                userId: userId,
                isOnline: true,
                lastSeen: new Date()
              });
            } catch (err) {
              console.error("Error updating user online status on join:", err);
            }
          } else if (retries > 0) {
            // Retry after 500ms if MongoDB is not connected yet
            setTimeout(() => updateStatusOnJoin(retries - 1), 500);
          }
        };
        
        updateStatusOnJoin();
      }
      
      // Add to our tracking set
      joinedRooms.add(roomId);
      
      // Join the socket room
      socket.join(roomId);
      
      // Confirm join to client
      socket.emit('joined', { room: roomId });
    });

    // Listen for sendMessage but DON'T emit back to sender
    socket.on("sendMessage", (msg) => {
      // Ensure we're using the normalized conversation ID
      let conversationId = msg.conversationId;
      if (conversationId.startsWith('sample-')) {
        conversationId = conversationId.replace('sample-', '');
      }
      
      
      console.log(`Broadcasting message from ${socket.id} (user: ${msg.senderId || 'unknown'}) to room ${conversationId}`);
      
      // Only broadcast to OTHER clients in the room
      // Make sure we're not sending back to the original sender
      socket.broadcast.to(conversationId).emit("newMessage", msg);
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      
      // Mark user as offline if we have their userId (only if MongoDB is connected)
      if (socketUser && (isConnected() || mongoose.connection.readyState === 1)) {
        try {
          await User.findByIdAndUpdate(socketUser, {
            isOnline: false,
            lastSeen: new Date()
          });

          // Notify all other users that this user is now offline
          socket.broadcast.emit("userStatusChanged", {
            userId: socketUser,
            isOnline: false,
            lastSeen: new Date()
          });

          console.log(`User ${socketUser} is now offline`);
        } catch (error) {
          console.error("Error updating user offline status:", error);
        }
      }
      
      // Clean up our tracking
      joinedRooms.clear();
      socketUser = null;
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

