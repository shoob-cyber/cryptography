
"use client";

import type { ChatContact } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  contact: ChatContact;
  isSelected: boolean;
  onSelectContact: (contact: ChatContact) => void;
}

export function ChatListItem({ contact, isSelected, onSelectContact }: ChatListItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <button
      onClick={() => onSelectContact(contact)}
      className={cn(
        "flex items-center w-full p-3 hover:bg-muted/80 transition-colors rounded-lg",
        isSelected ? "bg-muted" : "bg-transparent"
      )}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint={contact.dataAiHint} />
        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left">
        <p className="font-medium text-sm text-foreground">{contact.name}</p>
        {contact.lastMessage && (
          <p className={cn(
            "text-xs truncate",
            isSelected ? "text-muted-foreground" : "text-muted-foreground/80"
          )}>
            {contact.lastMessage}
          </p>
        )}
      </div>
      {/* Optional: Unread count or last message time */}
      {/* {contact.unreadCount && contact.unreadCount > 0 && (
        <Badge variant="default" className="ml-auto text-xs">{contact.unreadCount}</Badge>
      )} */}
    </button>
  );
}
