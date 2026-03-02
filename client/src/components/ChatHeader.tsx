import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Search, Download, Share2 } from 'lucide-react';

interface ChatHeaderProps {
  onChatSelect?: (chatId: string) => void;
}

export function ChatHeader({ onChatSelect }: ChatHeaderProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-10">
      {/* Main Header Row */}
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        {/* Left: Chat Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4">
              <Menu className="w-4 h-4" />
              <span>Chat</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => onChatSelect?.('new')}>New Chat</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChatSelect?.('recent')}>Recent Chats</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChatSelect?.('archived')}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Toolbar Icons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
            <Download className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
