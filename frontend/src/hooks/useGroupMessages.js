import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchGroupMessages, addGroupMessage, sendGroupMessage as sendGroupMessageAction } from '../store/slices/chatSlice';
import { encryptMessageForGroup, decryptGroupMessage } from '../utils/groupEncryption';

/**
 * Custom hook for handling group messaging with encryption
 * @param {object} socket - Socket.io client instance
 * @param {object} activeGroup - Currently active group
 * @param {object} user - Current user
 * @param {boolean} isCryptoInitialized - Whether crypto is initialized
 * @returns {object} - Group messaging methods and state
 */
export default function useGroupMessages(socket, activeGroup, user, isCryptoInitialized) {
  const dispatch = useDispatch();
  const { groupMessages, isGroupMessagesLoading } = useSelector(state => state.chat);
  const [decryptedGroupMessages, setDecryptedGroupMessages] = useState({});
  const [isJoinedGroup, setIsJoinedGroup] = useState(false);

  // Get current group's messages
  const currentGroupMessages = activeGroup ? groupMessages[activeGroup.id] || [] : [];

  // Join group room when active group changes
  useEffect(() => {
    if (!socket || !activeGroup) {
      setIsJoinedGroup(false);
      return;
    }

    console.log(`[GROUP] Joining group room: ${activeGroup.id}`);
    socket.emit('joinGroup', {
      groupId: activeGroup.id,
      userId: user.id
    });

    setIsJoinedGroup(true);

    // Load group messages
    dispatch(fetchGroupMessages({ groupId: activeGroup.id }));

    return () => {
      if (socket && activeGroup) {
        console.log(`[GROUP] Leaving group room: ${activeGroup.id}`);
        socket.emit('leaveGroup', { groupId: activeGroup.id });
        setIsJoinedGroup(false);
      }
    };
  }, [socket, activeGroup, user, dispatch]);

  // Decrypt group messages
  useEffect(() => {
    const decryptMessagesAsync = async () => {
      if (!currentGroupMessages.length || !isCryptoInitialized || !activeGroup) {
        return;
      }

      const newDecrypted = {};

      for (const msg of currentGroupMessages) {
        // Skip if already decrypted or not encrypted
        if (decryptedGroupMessages[msg.id] || !msg.isEncrypted) {
          newDecrypted[msg.id] = decryptedGroupMessages[msg.id] || msg.text;
          continue;
        }

        try {
          console.log(`🔓 Decrypting group message ${msg.id}`);

          const decrypted = await decryptGroupMessage(
            {
              encryptedData: msg.encryptedData,
              iv: msg.iv,
              authTag: msg.authTag
            },
            activeGroup.id,
            user.id || user._id,
            activeGroup.createdBy.id
          );

          newDecrypted[msg.id] = decrypted;
          console.log(`✅ Decrypted group message ${msg.id}`);
        } catch (error) {
          console.error(`❌ Failed to decrypt group message ${msg.id}:`, error);
          newDecrypted[msg.id] = '[Decryption failed]';
        }
      }

      setDecryptedGroupMessages(prev => ({ ...prev, ...newDecrypted }));
    };

    decryptMessagesAsync();
  }, [currentGroupMessages, isCryptoInitialized, activeGroup, user, decryptedGroupMessages]);

  // Listen for incoming group messages
  useEffect(() => {
    if (!socket || !activeGroup) return;

    const handleNewGroupMessage = async (message) => {
      console.log('[GROUP] Received new group message:', message);

      // Add to Redux store
      dispatch(addGroupMessage({ groupId: message.groupId, message }));

      // Decrypt if encrypted
      if (message.isEncrypted) {
        try {
          const plaintext = await decryptGroupMessage(
            {
              encryptedData: message.encryptedData,
              iv: message.iv,
              authTag: message.authTag
            },
            message.groupId,
            user.id || user._id,
            activeGroup.createdBy.id
          );

          setDecryptedGroupMessages(prev => ({
            ...prev,
            [message.id]: plaintext
          }));
        } catch (error) {
          console.error('Failed to decrypt incoming group message:', error);
          setDecryptedGroupMessages(prev => ({
            ...prev,
            [message.id]: '[Decryption failed]'
          }));
        }
      }
    };

    socket.on('newGroupMessage', handleNewGroupMessage);

    return () => {
      socket.off('newGroupMessage', handleNewGroupMessage);
    };
  }, [socket, activeGroup, user, dispatch]);

  // Send group message
  const sendMessage = useCallback(async (text) => {
    if (!activeGroup || !text.trim() || !isJoinedGroup) {
      console.warn('[GROUP] Cannot send message: group not active or not joined');
      return;
    }

    try {
      // Encrypt the message
      const encrypted = await encryptMessageForGroup(
        text,
        activeGroup.id,
        user.id || user._id,
        activeGroup.createdBy.id
      );

      const messageData = {
        text: '[Encrypted]',
        ...encrypted,
        isEncrypted: true
      };

      // Send to server
      const result = await dispatch(sendGroupMessageAction({
        groupId: activeGroup.id,
        messageData
      })).unwrap();

      const sentMessage = result.message;

      // Emit via socket to notify other members
      socket.emit('sendGroupMessage', {
        ...sentMessage,
        groupId: activeGroup.id,
        senderId: user.id || user._id
      });

      // Store decrypted version locally
      setDecryptedGroupMessages(prev => ({
        ...prev,
        [sentMessage.id]: text
      }));

      console.log('[GROUP] Message sent successfully');
      return sentMessage;
    } catch (error) {
      console.error('[GROUP] Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }, [activeGroup, user, dispatch, socket, isJoinedGroup]);

  return {
    messages: currentGroupMessages,
    decryptedMessages: decryptedGroupMessages,
    isLoading: isGroupMessagesLoading,
    sendMessage,
    isJoinedGroup
  };
}
