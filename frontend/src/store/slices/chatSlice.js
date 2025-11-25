import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../axiosInstance';
import { toast } from "react-hot-toast";

// Async thunks
export const fetchContacts = createAsyncThunk(
  "chat/fetchContacts",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/messages/contacts");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/messages/${conversationId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, messageData }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/messages`,
        messageData
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const searchGlobalUsers = createAsyncThunk(
  "chat/searchGlobalUsers",
  async (query, thunkAPI) => {
    try {
      // Assuming you create a backend route: GET /api/users/search?query=...
      const response = await axiosInstance.get(`/users/search?query=${query}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

// NEW: Add a user to your contact list (simulated "Request Accepted")
export const addNewContact = createAsyncThunk(
  "chat/addNewContact",
  async (userId, thunkAPI) => {
    try {
      // Assuming backend route: POST /api/contacts/add { userId }
      // This endpoint should create a conversation entry in DB if it doesn't exist
      const response = await axiosInstance.post(`/contacts/add`, { userId }); 
      return response.data; // Should return the new contact object
    } catch (error) {
      toast.error("Failed to add contact");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    contacts: [],
    messages: [],
    searchResults: [], // Store global search results here
    selectedContact: null,
    isContactsLoading: false,
    isMessagesLoading: false,
    isSearching: false, // UI loading state for search
    error: null,
  },
  reducers: {
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload;
    },
    clearChatState: (state) => {
      state.contacts = [];
      state.messages = [];
      state.selectedContact = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    // Clear search results when closing the search view
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchContacts
      .addCase(fetchContacts.pending, (state) => {
        state.isContactsLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isContactsLoading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isContactsLoading = false;
        state.error = action.payload;
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isMessagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isMessagesLoading = false;
        state.error = action.payload;
      })
      // sendMessage
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(searchGlobalUsers.pending, (state) => {
      state.isSearching = true;
      })
      .addCase(searchGlobalUsers.fulfilled, (state, action) => {
      state.isSearching = false;
      // Filter out users who are ALREADY in contacts
      const contactIds = new Set(state.contacts.map(c => c.id));
      state.searchResults = action.payload.filter(user => !contactIds.has(user.id));
    })
      .addCase(searchGlobalUsers.rejected, (state) => {
      state.isSearching = false;
      state.searchResults = [];
    })
    .addCase(addNewContact.fulfilled, (state, action) => {
      // Add the new contact to the list immediately
      state.contacts.unshift(action.payload);
      state.selectedContact = action.payload; // Auto-select them
      state.searchResults = []; // Clear search
    });
  },
});

export const { setSelectedContact, clearChatState, addMessage, clearSearchResults } = chatSlice.actions;
export default chatSlice.reducer;
