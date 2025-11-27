import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchGlobalUsers, addNewContact, clearSearchResults, setSelectedContact } from '../../store/slices/chatSlice';

export default function ContactsSidebar({ contacts = [], activeId, setActiveId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlobalSearchMode, setIsGlobalSearchMode] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state for global search
  const { searchResults, isSearching } = useSelector(state => state.chat);

  // Local Filter Logic (filters existing contacts)
  const localFiltered = searchTerm && !isGlobalSearchMode
    ? contacts.filter(c => c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : contacts;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setIsGlobalSearchMode(false);
      dispatch(clearSearchResults());
    }
  };

  const handleGlobalSearch = () => {
    if (!searchTerm.trim()) return;
    setIsGlobalSearchMode(true);
    dispatch(searchGlobalUsers(searchTerm));
  };

  const handleAddUser = async (user) => {
    // Add user -> Redux updates 'contacts' list -> we select them
    const resultAction = await dispatch(addNewContact(user.id));
    if (addNewContact.fulfilled.match(resultAction)) {
      const newContact = resultAction.payload;
      
      // Reset search UI
      setSearchTerm('');
      setIsGlobalSearchMode(false);
      dispatch(clearSearchResults());

      // Navigate to chat
      if (setActiveId) setActiveId(newContact.id);
      dispatch(setSelectedContact(newContact));
      
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, activeConversation: newContact.id }
      });
    }
  };

  const selectContact = (contact) => {
    if (setActiveId) setActiveId(contact.id);
    dispatch(setSelectedContact(contact));
    navigate(location.pathname, {
      replace: true,
      state: { ...location.state, activeConversation: contact.id }
    });
  };

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-semibold text-foreground mb-3">Messages</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
            />
          </div>
          {/* Global Search Button */}
          {searchTerm && !isGlobalSearchMode && (
            <button 
              onClick={handleGlobalSearch}
              className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition"
              title="Search Directory"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border py-2">
        {isGlobalSearchMode ? (
          /* VIEW 1: Global Search Results */
          <div className="px-2">
            <div className="flex items-center justify-between px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Directory Results</span>
              <button 
                onClick={() => setIsGlobalSearchMode(false)}
                className="text-primary hover:underline cursor-pointer"
              >
                Back to Contacts
              </button>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span className="text-sm">Searching users...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-lg font-medium text-secondary-foreground">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</p>
                  </div>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                    title="Start Conversation"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: Existing Contacts (Default) */
          <>
            {localFiltered && localFiltered.length > 0 ? localFiltered.map(contact => (
              <button
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                  activeId === contact.id ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium text-primary">
                    {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background bg-success" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-foreground truncate">{contact.name || 'Unknown'}</p>
                    <span className="text-[10px] text-muted-foreground">{contact.lastSeen === 'Online' ? '' : contact.lastSeen}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {contact.lastMessage || "Tap to chat"}
                  </p>
                </div>
                {contact.unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                    {contact.unreadCount}
                  </span>
                )}
              </button>
            )) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No contacts found.</p>
                {searchTerm && (
                  <button 
                    onClick={handleGlobalSearch}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Search globally for "{searchTerm}"
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

ContactsSidebar.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
      isOnline: PropTypes.bool,
      lastSeen: PropTypes.string,
      lastMessage: PropTypes.string,
      unreadCount: PropTypes.number,
    })
  ),
  activeId: PropTypes.string,
  setActiveId: PropTypes.func.isRequired,
};