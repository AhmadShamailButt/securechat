import React from 'react';
import PropTypes from 'prop-types';
import { MoreVertical, PhoneCall, Video } from 'lucide-react';

export default function ChatHeader({ activeContact }) {
  // Safety guard
  if (!activeContact) return null;

  const name = activeContact.name || "Unknown User";
  const initial = name.charAt(0).toUpperCase();
  const isOnline = activeContact.isOnline || false;
  const statusText = isOnline ? 'Online' : (activeContact.lastSeen || 'Offline');

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0 h-16">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-lg font-semibold text-primary">
              {initial}
            </span>
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-foreground leading-none">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {statusText}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Voice Call"
        >
          <PhoneCall className="h-5 w-5 text-muted-foreground" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Video Call"
        >
          <Video className="h-5 w-5 text-muted-foreground" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="More Options"
        >
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

ChatHeader.propTypes = {
  activeContact: PropTypes.shape({
    name: PropTypes.string,
    isOnline: PropTypes.bool,
    lastSeen: PropTypes.string,
  }),
};