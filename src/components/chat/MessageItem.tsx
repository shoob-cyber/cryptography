"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  currentUserId: string; // To determine if the message is from the current user
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isSender = message.senderId === currentUserId;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[75%] mb-4",
        isSender ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.avatar} alt={message.senderName || "User"} data-ai-hint="profile avatar" />
        <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "p-3 rounded-lg shadow-md",
          isSender
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-card text-card-foreground rounded-tl-none border"
        )}
      >
        <p className="text-sm">{message.decryptedText || message.text}</p>
        <p className={cn(
            "text-xs mt-1",
            isSender ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
          {format(new Date(message.timestamp), "p")}
          {message.status === 'sending' && ' (sending...)'}
          {message.status === 'failed' && ' (failed)'}
        </p>
      </div>
    </div>
  );
}
