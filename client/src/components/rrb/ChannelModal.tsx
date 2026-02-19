import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  listeners: number;
  isLive: boolean;
  color: string;
}

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
  selectedChannelId?: string;
}

export function ChannelModal({
  isOpen,
  onClose,
  channels,
  onSelectChannel,
  selectedChannelId,
}: ChannelModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto p-0 rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Select Channel</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => {
                onSelectChannel(channel.id);
                onClose();
              }}
              className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                selectedChannelId === channel.id
                  ? `border-${channel.color} bg-${channel.color} bg-opacity-10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      channel.isLive ? `bg-${channel.color}` : 'bg-gray-300'
                    }`}
                  />
                  <h3 className="font-semibold text-base">{channel.name}</h3>
                </div>
                {selectedChannelId === channel.id && (
                  <div className="text-sm font-medium text-green-600">✓ Selected</div>
                )}
              </div>
              <div className="text-sm text-gray-600 ml-5">
                {channel.listeners.toLocaleString()} listeners
                {channel.isLive && ' • Live'}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
