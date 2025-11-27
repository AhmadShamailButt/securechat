import React, { useState } from "react";
import PropTypes from "prop-types";
import { Send, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";

export default function ChatArea({
  activeContact,
  messages = [],
  loading = false,
  isConnected = true,
  connectError = null,
  handleSend,
  currentUserId,
}) {
  const [messageText, setMessageText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() && handleSend) {
      handleSend(e, messageText);
      setMessageText("");
    }
  };

  // Safety check: if activeContact is missing, prevent crash
  if (!activeContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        Select a contact
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <ChatHeader activeContact={activeContact} />

      {/* Message list */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        <MessageList
          messages={messages}
          loading={loading}
          currentUserId={currentUserId}
        />
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isConnected ? "Type a message…" : "Reconnecting…"}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={cn(
              "p-2 rounded-md transition-colors flex items-center justify-center",
              isConnected && messageText.trim()
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            disabled={!isConnected || !messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        {/* Status Indicators */}
        {!isConnected && (
          <div className="mt-2 flex items-center gap-2 text-xs text-warning">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Disconnected. Reconnecting…</span>
          </div>
        )}
        {connectError && (
          <div className="mt-1 flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>Error: {connectError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Strict Prop Validation
ChatArea.propTypes = {
  activeContact: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    isOnline: PropTypes.bool,
    lastSeen: PropTypes.string,
  }).isRequired,
  messages: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  isConnected: PropTypes.bool,
  connectError: PropTypes.string,
  handleSend: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};