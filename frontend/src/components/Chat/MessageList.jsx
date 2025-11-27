import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export default function MessageList({ messages = [], loading = false, currentUserId }) {
  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-4 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading messages...
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-4 text-muted-foreground opacity-70">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble 
          key={msg.id || index} 
          message={msg} 
          currentUserId={currentUserId} 
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, currentUserId }) {
  const isMine = message.senderId === currentUserId || message.senderId === 'me';
  
  return (
    <div
      className={cn(
        "flex w-full",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[75%] sm:max-w-md rounded-2xl px-4 py-2 break-words shadow-sm",
        isMine 
          ? "bg-primary text-primary-foreground rounded-tr-none"
          : "bg-muted text-foreground rounded-tl-none"
      )}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={cn(
          "text-[10px] mt-1 flex items-center justify-end gap-1",
          isMine
            ? "text-primary-foreground/70"
            : "text-muted-foreground"
        )}>
          {message.timestamp}
          {message.pending && <span>⏳</span>}
          {message.failed && <span className="text-destructive">❌</span>}
        </div>
      </div>
    </div>
  );
}

// Strict Prop Validation
MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string.isRequired,
      senderId: PropTypes.string.isRequired,
      timestamp: PropTypes.string,
      pending: PropTypes.bool,
      failed: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  currentUserId: PropTypes.string,
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  currentUserId: PropTypes.string,
};