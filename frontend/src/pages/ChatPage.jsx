import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/socket';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import ContactsSidebar from "../Components/Messaging/ContactsSidebar";
import ChatArea from "../Components/Messaging/ChatArea";
import EmptyChatState from "../Components/Messaging/EmptyChatState";

// Add API base URL - make sure this matches your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults and add authorization header
axios.defaults.baseURL = API_URL;
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Messages() {
  const location = useLocation();
  const { socket, isConnected, connectError, reconnect } = useSocket();
  const user = useSelector(state => state.user.userDetails);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [pendingMessages, setPendingMessages] = useState({});
  // Track processed message IDs to prevent duplicates
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());

  // Check for activeConversation in location state (from navigation)
  useEffect(() => {
    if (location.state?.activeConversation) {
      setActiveId(location.state.activeConversation);
    }
  }, [location.state]);

  // Load contacts once
  useEffect(() => {
    if (!user) return; // Make sure we have user details

    setLoading(true);
    console.log('Fetching contacts from:', `${API_URL}/api/messages/contacts`);

    axios.get('/api/messages/contacts')
      .then(res => {
        console.log('Contacts response:', res.data);
        // Handle both array format and object format with contacts property
        const contactsArray = Array.isArray(res.data) ? res.data : (res.data.contacts || []);
        setContacts(contactsArray);
        
        // If we have an activeId from navigation, use that
        // Otherwise use the first contact
        if (!activeId && contactsArray.length > 0) {
          setActiveId(contactsArray[0].id);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, [user]);

  // Join room effect - separate from message loading
  useEffect(() => {
    if (!activeId || !isConnected) return;

    console.log('Joining room for conversation:', activeId);
    // Join with user information
    socket.emit('join', {
      conversationId: activeId,
      userId: user?.id // Send user ID to help track the socket
    });

    // Listen for join confirmation
    const handleJoined = (data) => {
      console.log('Joined room:', data);
      setJoinedRoom(true);
    };

    socket.on('joined', handleJoined);

    return () => {
      socket.off('joined', handleJoined);
      setJoinedRoom(false);
    };
  }, [activeId, isConnected, socket, user]);

  // Load messages when active contact changes and reset processed message IDs
  useEffect(() => {
    if (!activeId) return;

    // Reset processed message IDs when changing conversations
    setProcessedMessageIds(new Set());

    setLoading(true);
    axios.get(`/api/messages/${activeId}`)
      .then(res => {
        console.log('Messages loaded:', res.data);
        const loadedMessages = res.data || [];

        // Add all loaded message IDs to our processed set
        const newProcessedIds = new Set(processedMessageIds);
        loadedMessages.forEach(msg => {
          if (msg.id && !msg.id.startsWith('temp-')) {
            newProcessedIds.add(msg.id);
          }
        });
        setProcessedMessageIds(newProcessedIds);

        setMessages(loadedMessages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading messages:', err);
        setError('Failed to load messages: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, [activeId]);

  // Listen for new messages - separate effect for socket events
  useEffect(() => {
    if (!isConnected || !activeId) return;

    const handleNewMessage = (msg) => {
      console.log('New message received:', msg);

      // Skip processing if this isn't for our active conversation
      if (msg.conversationId !== activeId) {
        return;
      }

      // Check if we've already processed this message
      if (msg.id && processedMessageIds.has(msg.id)) {
        console.log('Skipping duplicate message:', msg.id);
        return;
      }

      // Add message ID to processed set to prevent duplicates
      if (msg.id) {
        setProcessedMessageIds(prev => new Set(prev).add(msg.id));
      }

      // Fix: Check if message is from the current user by comparing sender IDs
      // If the message is from us, we may have already added it optimistically
      // Only add messages from other users or messages not yet in our state
      const isFromCurrentUser = msg.senderId === user?.id;
      const isAlreadyInMessages = messages.some(existingMsg =>
        existingMsg.id === msg.id ||
        (existingMsg.text === msg.text &&
          existingMsg.senderId === msg.senderId &&
          Math.abs(new Date(existingMsg.timestamp) - new Date(msg.timestamp)) < 5000)
      );

      if (!isAlreadyInMessages) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [isConnected, activeId, socket, pendingMessages, processedMessageIds, messages, user]);

  const handleSend = (e, messageText) => {
    e.preventDefault();
    if (!messageText.trim() || !activeId || !isConnected) return;

    console.log('Sending message to conversation:', activeId);

    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    // Create the message object for optimistic UI update
    const newMessage = {
      id: tempId,
      conversationId: activeId,
      senderId: user?.id || 'me', // Use actual user ID if available
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true // Mark as pending until confirmed
    };

    // Add to UI immediately (optimistic update)
    setMessages(prev => [...prev, newMessage]);

    // Send message to server and through socket
    axios.post('/api/messages', {
      conversationId: activeId,
      text: messageText.trim(),
      senderId: user?.id // Include sender ID explicitly
    })
      .then(response => {
        console.log('Message sent successfully:', response.data);

        // Mark this message ID as processed to prevent duplicates from socket
        if (response.data.id) {
          setProcessedMessageIds(prev => new Set(prev).add(response.data.id));
        }

        // Add the real message ID to our pending messages map
        setPendingMessages(prev => ({
          ...prev,
          [response.data.id]: tempId
        }));

        // Update the temporary message with the real message ID and remove pending state
        setMessages(prev => prev.map(msg =>
          msg.id === tempId
            ? { ...response.data, pending: false }
            : msg
        ));
      })
      .catch(err => {
        console.error('Error sending message:', err);
        setError('Failed to send message: ' + (err.message || 'Unknown error'));

        // Mark the message as failed
        setMessages(prev => prev.map(msg =>
          msg.id === tempId
            ? { ...msg, failed: true, pending: false }
            : msg
        ));
      });
  };

  // Find the active contact based on activeId
  const activeContact = contacts.find(c => c.id === activeId);

  if (loading && contacts.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading contacts...</div>;
  }

  if (error && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isConnected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-center">
          <span>Connection to messaging service lost. </span>
          <button
            onClick={reconnect}
            className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-100"
          >
            Reconnect
          </button>
        </div>
      )}

      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-64px)] flex">
          {/* Contacts Sidebar */}
          <ContactsSidebar
            contacts={contacts}
            activeId={activeId}
            setActiveId={setActiveId}
          />

          {/* Chat Area or Empty State */}
          {activeContact ? (
            <ChatArea
              activeContact={activeContact}
              messages={messages}
              loading={loading}
              isConnected={isConnected}
              connectError={connectError}
              handleSend={handleSend}
              currentUserId={user?.id} // Pass current user ID to help with message styling
            />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </main>
    </div>
  );
}