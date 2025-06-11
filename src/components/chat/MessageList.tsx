"use client";

import { Message } from "@/types";
import { MessageItem } from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth-mock";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  if (!user) return null; // Should not happen if page is protected

  return (
    <ScrollArea className="h-[calc(100vh-18rem)] flex-grow p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No messages yet. Start a conversation!
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} currentUserId={user.id} />
        ))}
      </div>
    </ScrollArea>
  );
}
