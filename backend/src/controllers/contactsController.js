// backend/controllers/contactsController.js

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { isConnected } = require("../config/database");

/**
 * Helper to get current User ID from token
 */
const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET || "8ae74b4cf76c2e91531a6a5e7ed2ef3a62c4dcaee24d7b176fdfd0ba6c1e9abf";
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
};

/**
 * GET /api/messages/contacts
 * Returns existing conversations.
 */
exports.getContacts = async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) return res.status(401).json({ error: "Not authenticated" });

    // Check DB connection
    if (!isConnected() && mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database connection unavailable." });
    }

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .sort({ lastMessageTimestamp: -1 })
      .populate("participants", "fullName email gender department isOnline");

    const contacts = await Promise.all(
      conversations.map(async conv => {
        const other = conv.participants.find(
          p => p._id.toString() !== currentUserId
        );
        if (!other) return null;

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id.toString(),
          receiverId: currentUserId,
          read: false
        });

        return {
          id:           conv._id.toString(),
          userId:       other._id.toString(),
          name:         other.fullName,
          email:        other.email,
          department:   other.department,
          isOnline:     other.isOnline || false,
          lastMessage:  conv.lastMessage,
          lastSeen:     conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          unreadCount
        };
      })
    );

    return res.json(contacts.filter(c => c));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

/**
 * GET /api/users/search
 * Search for users globally by name or email (excludes current user).
 */
exports.searchUsers = async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Find users where name or email matches query, AND is NOT the current user
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select("fullName email department isOnline"); // Only return necessary fields

    // Map to frontend friendly format
    const results = users.map(u => ({
      id: u._id.toString(),
      name: u.fullName,
      email: u.email,
      department: u.department,
      isOnline: u.isOnline
    }));

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

/**
 * POST /api/contacts/add
 * Adds a user to contacts (creates conversation) and returns the contact object.
 */
exports.addContact = async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // 1. Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    });

    // 2. If not, create it
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUserId],
        lastMessage: "",
        lastMessageTimestamp: new Date()
      });
      await conversation.save();
    }

    // 3. Fetch target user details to construct the 'Contact' object
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Return the structure matching getContacts
    const newContact = {
      id:           conversation._id.toString(),
      userId:       targetUser._id.toString(),
      name:         targetUser.fullName,
      email:        targetUser.email,
      department:   targetUser.department,
      isOnline:     targetUser.isOnline || false,
      lastMessage:  conversation.lastMessage || "",
      lastSeen:     conversation.lastMessageTimestamp ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      unreadCount:  0 // New contact implies no unread messages initially
    };

    res.json(newContact);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ error: "Failed to add contact" });
  }
};