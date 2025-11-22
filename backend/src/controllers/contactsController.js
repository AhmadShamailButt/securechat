// backend/controllers/contactsController.js

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

exports.getContacts = async (req, res) => {
  try {
    // Authenticate
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const { userId: currentUserId } = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch all one-to-one conversations for this user, most recent first
    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .sort({ lastMessageTimestamp: -1 })
      .populate("participants", "fullName email gender department isOnline");

    // Build contact DTOs
    const contacts = await Promise.all(conversations.map(async conv => {
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
        socketRoomId: conv._id.toString(),        // use raw ID
        userId:       other._id.toString(),
        name:         other.fullName,
        email:        other.email,
        department:   other.department,
        gender:       other.gender,
        isOnline:     other.isOnline || false,
        lastMessage:  conv.lastMessage,
        lastSeen:     conv.lastMessageTimestamp
                         .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unreadCount
      };
    }));

    const validContacts = contacts.filter(c => c);
    if (validContacts.length) {
      return res.json(validContacts);
    }

    // If no existing conversations, seed up to 5 real ones
    const others = await User.find({ _id: { $ne: currentUserId } })
      .select("fullName email gender department isOnline")
      .limit(5);

    const seeded = await Promise.all(others.map(async user => {
      let conv = await Conversation.findOne({
        participants: { $all: [currentUserId, user._id] }
      });
      if (!conv) {
        conv = await Conversation.create({
          participants: [currentUserId, user._id],
          lastMessage: "",
          lastMessageTimestamp: Date.now()
        });
      }

      return {
        id:           conv._id.toString(),
        socketRoomId: conv._id.toString(),
        userId:       user._id.toString(),
        name:         user.fullName,
        email:        user.email,
        department:   user.department,
        gender:       user.gender,
        isOnline:     user.isOnline || false,
        lastMessage:  conv.lastMessage || "",
        lastSeen:     conv.lastMessageTimestamp
                         .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unreadCount:  0
      };
    }));

    return res.json(seeded);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};
