import React from 'react';
import { MoreVertical, PhoneCall, Video } from 'lucide-react';

export default function ChatHeader({ activeContact }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-lg font-semibold text-primary">
              {activeContact.name.charAt(0)}
            </span>
          </div>
          {activeContact.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-foreground">{activeContact.name || activeContact.fullName}</h3>
          <p className="text-xs text-muted-foreground">
            {activeContact.isOnline ? (
              'Online'
            ) : activeContact.lastSeen ? (
              (() => {
                try {
                  const lastSeenDate = new Date(activeContact.lastSeen);
                  const now = new Date();
                  const diffMs = now - lastSeenDate;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  return lastSeenDate.toLocaleDateString();
                } catch (e) {
                  return 'Offline';
                }
              })()
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <PhoneCall className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <Video className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

