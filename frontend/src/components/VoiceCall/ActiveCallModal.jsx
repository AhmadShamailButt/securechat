import React, { useMemo } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX, PhoneOff, Signal, SignalLow, SignalMedium } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useCallingTone } from '../../hooks/useCallTones';

export default function ActiveCallModal({
  isOpen,
  contactName,
  callStatus,
  duration,
  isMuted,
  isSpeakerOn,
  connectionQuality = 'good',
  connectionStats = null,
  onToggleMute,
  onToggleSpeaker,
  onEndCall
}) {
  // Play calling tone when status is 'calling' (caller end)
  const isCalling = isOpen && callStatus === 'calling';
  useCallingTone(isCalling);
  // Format duration as MM:SS
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [duration]);

  // Get status text based on call status
  const statusText = useMemo(() => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formattedDuration;
      default:
        return '';
    }
  }, [callStatus, formattedDuration]);

  // Get connection quality indicator
  const qualityIndicator = useMemo(() => {
    if (callStatus !== 'connected') return null;
    
    const qualityConfig = {
      good: {
        icon: Signal,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        label: 'Excellent',
        description: 'Clear connection'
      },
      fair: {
        icon: SignalMedium,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        label: 'Good',
        description: 'Acceptable quality'
      },
      poor: {
        icon: SignalLow,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        label: 'Poor',
        description: 'Connection issues'
      }
    };
    
    return qualityConfig[connectionQuality] || qualityConfig.good;
  }, [connectionQuality, callStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // When dialog is closed (X button clicked), end the call
      if (!open && onEndCall) {
        onEndCall();
      }
    }}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          // End call on Escape key
          if (onEndCall) {
            onEndCall();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Voice Call</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Contact avatar */}
          <div className="relative">
            <div className={cn(
              "h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center",
              callStatus === 'calling' || callStatus === 'ringing' || callStatus === 'connecting' ? 'animate-pulse' : ''
            )}>
              <span className="text-3xl font-semibold text-primary">
                {contactName.charAt(0).toUpperCase()}
              </span>
            </div>
            {(callStatus === 'calling' || callStatus === 'ringing' || callStatus === 'connecting') && (
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
            )}
          </div>

          {/* Contact name and status */}
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">{contactName}</p>
            <p className="text-sm text-muted-foreground mt-1">{statusText}</p>
            {/* Connection quality */}
            {callStatus === 'connected' && (
              <div className="flex flex-col items-center gap-2 mt-2">
                {/* Connection quality indicator */}
                {qualityIndicator && (
                  <div className={cn(
                    "flex items-center justify-center gap-1.5 px-2 py-1 rounded-full",
                    qualityIndicator.bgColor
                  )}>
                    <qualityIndicator.icon className={cn("h-3 w-3", qualityIndicator.color)} />
                    <span className={cn("text-xs font-medium", qualityIndicator.color)}>
                      {qualityIndicator.label}
                    </span>
                    {connectionStats && (connectionStats.packetLossPercentFormatted || connectionStats.packetLossPercent) && (
                      <span className={cn("text-xs", qualityIndicator.color)}>
                        ({(connectionStats.packetLossPercentFormatted || connectionStats.packetLossPercent)}% loss)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Call controls */}
          <div className="flex gap-4 mt-4">
            {/* Mute/Unmute button */}
            <Button
              onClick={onToggleMute}
              className={cn(
                "h-12 w-12 rounded-full",
                isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              )}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Speaker button */}
            <Button
              onClick={onToggleSpeaker}
              className={cn(
                "h-12 w-12 rounded-full",
                isSpeakerOn
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              )}
              title={isSpeakerOn ? "Speaker on" : "Speaker off"}
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            {/* End call button */}
            <Button
              onClick={onEndCall}
              className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white"
              title="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
