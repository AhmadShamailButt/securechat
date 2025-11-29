/**
 * Group Encryption Utilities
 * Helper functions for managing group encryption workflows
 */

import cryptoService from '../services/cryptoService';
import { storeGroupKey, getGroupKey } from '../services/groupService';
import axiosInstance from '../store/axiosInstance';

/**
 * Fetch a user's public key from the server
 */
export async function fetchUserPublicKey(userId) {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}/public-key`);
    return response.data.publicKey;
  } catch (error) {
    console.error(`Failed to fetch public key for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Initialize group encryption when creating a new group
 * Generates a group key and encrypts it for all members
 *
 * @param {string} groupId - The group ID
 * @param {Array} members - Array of member objects with { id, name, ... }
 * @param {string} creatorId - ID of the group creator
 * @returns {Promise<void>}
 */
export async function initializeGroupEncryption(groupId, members, creatorId) {
  try {
    console.log(`🔐 Initializing encryption for group ${groupId} with ${members.length} members`);

    // 1. Generate a new AES-GCM group key
    const groupKey = await cryptoService.generateGroupKey();

    // 2. Cache the group key locally
    cryptoService.setGroupKey(groupId, groupKey);

    // 3. Encrypt and store the group key for each member
    for (const member of members) {
      try {
        // Fetch member's public key
        const memberPublicKey = await fetchUserPublicKey(member.id);

        // Encrypt group key with member's public key
        const encryptedKeyData = await cryptoService.encryptGroupKeyForMember(
          groupKey,
          memberPublicKey,
          member.id
        );

        // Store encrypted key on server
        await storeGroupKey(groupId, {
          userId: member.id,
          ...encryptedKeyData
        });

        console.log(`✅ Group key encrypted and stored for member: ${member.name || member.id}`);
      } catch (error) {
        console.error(`Failed to encrypt key for member ${member.id}:`, error);
        // Continue with other members even if one fails
      }
    }

    console.log(`🎉 Group encryption initialized successfully for group ${groupId}`);
  } catch (error) {
    console.error('Failed to initialize group encryption:', error);
    throw error;
  }
}

/**
 * Add encryption key for a new group member
 * Fetches the group key, decrypts it, and encrypts it for the new member
 *
 * @param {string} groupId - The group ID
 * @param {string} newMemberId - ID of the new member to add
 * @param {string} currentUserId - ID of the current user (who is adding the member)
 * @param {string} groupCreatorId - ID of the group creator
 * @returns {Promise<void>}
 */
export async function addMemberEncryptionKey(groupId, newMemberId, currentUserId, groupCreatorId) {
  try {
    console.log(`🔐 Adding encryption key for new member ${newMemberId} in group ${groupId}`);

    // 1. Get the group key (from cache or server)
    let groupKey = cryptoService.getGroupKey(groupId);

    if (!groupKey) {
      // Fetch encrypted group key for current user
      const encryptedKeyData = await getGroupKey(groupId, currentUserId);

      // Fetch creator's public key to derive shared key
      const creatorPublicKey = await fetchUserPublicKey(groupCreatorId);

      // Decrypt the group key
      groupKey = await cryptoService.decryptGroupKey(
        encryptedKeyData,
        creatorPublicKey,
        groupCreatorId,
        groupId
      );
    }

    // 2. Fetch new member's public key
    const newMemberPublicKey = await fetchUserPublicKey(newMemberId);

    // 3. Encrypt group key for new member
    const encryptedKeyForNewMember = await cryptoService.encryptGroupKeyForMember(
      groupKey,
      newMemberPublicKey,
      newMemberId
    );

    // 4. Store encrypted key on server
    await storeGroupKey(groupId, {
      userId: newMemberId,
      ...encryptedKeyForNewMember
    });

    console.log(`✅ Encryption key added for new member ${newMemberId}`);
  } catch (error) {
    console.error('Failed to add member encryption key:', error);
    throw error;
  }
}

/**
 * Fetch and decrypt the group key for the current user
 *
 * @param {string} groupId - The group ID
 * @param {string} currentUserId - ID of the current user
 * @param {string} groupCreatorId - ID of the group creator
 * @returns {Promise<CryptoKey>} - The decrypted AES group key
 */
export async function fetchAndDecryptGroupKey(groupId, currentUserId, groupCreatorId) {
  try {
    // Check cache first
    let groupKey = cryptoService.getGroupKey(groupId);

    if (groupKey) {
      console.log(`🔑 Using cached group key for group ${groupId}`);
      return groupKey;
    }

    console.log(`🔐 Fetching and decrypting group key for group ${groupId}`);

    // Fetch encrypted group key from server
    const encryptedKeyData = await getGroupKey(groupId, currentUserId);

    // Fetch creator's public key
    const creatorPublicKey = await fetchUserPublicKey(groupCreatorId);

    // Decrypt the group key
    groupKey = await cryptoService.decryptGroupKey(
      encryptedKeyData,
      creatorPublicKey,
      groupCreatorId,
      groupId
    );

    console.log(`✅ Group key decrypted for group ${groupId}`);
    return groupKey;
  } catch (error) {
    console.error('Failed to fetch and decrypt group key:', error);
    throw error;
  }
}

/**
 * Encrypt a message for a group
 *
 * @param {string} plaintext - The message to encrypt
 * @param {string} groupId - The group ID
 * @param {string} currentUserId - ID of the current user
 * @param {string} groupCreatorId - ID of the group creator
 * @returns {Promise<Object>} - Encryption data { encryptedData, iv, authTag }
 */
export async function encryptMessageForGroup(plaintext, groupId, currentUserId, groupCreatorId) {
  try {
    // Get or fetch the group key
    const groupKey = await fetchAndDecryptGroupKey(groupId, currentUserId, groupCreatorId);

    // Encrypt the message
    const { ciphertext, iv, authTag } = await cryptoService.encryptGroupMessage(
      plaintext,
      groupKey
    );

    return {
      encryptedData: ciphertext,
      iv,
      authTag
    };
  } catch (error) {
    console.error('Failed to encrypt message for group:', error);
    throw error;
  }
}

/**
 * Decrypt a group message
 *
 * @param {Object} encryptedData - Object with { encryptedData, iv, authTag }
 * @param {string} groupId - The group ID
 * @param {string} currentUserId - ID of the current user
 * @param {string} groupCreatorId - ID of the group creator
 * @returns {Promise<string>} - The decrypted plaintext message
 */
export async function decryptGroupMessage(encryptedData, groupId, currentUserId, groupCreatorId) {
  try {
    // Get or fetch the group key
    const groupKey = await fetchAndDecryptGroupKey(groupId, currentUserId, groupCreatorId);

    // Decrypt the message
    const plaintext = await cryptoService.decryptGroupMessage(
      {
        ciphertext: encryptedData.encryptedData,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag
      },
      groupKey
    );

    return plaintext;
  } catch (error) {
    console.error('Failed to decrypt group message:', error);
    throw error;
  }
}

export default {
  fetchUserPublicKey,
  initializeGroupEncryption,
  addMemberEncryptionKey,
  fetchAndDecryptGroupKey,
  encryptMessageForGroup,
  decryptGroupMessage
};
