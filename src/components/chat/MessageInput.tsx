"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

export function MessageInput({ onSendMessage, isSending }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t p-4 bg-background"
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your encrypted message..."
        className="flex-grow resize-none rounded-lg border shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={isSending}
      />
      <Button type="submit" size="icon" className="rounded-full" disabled={isSending || !text.trim()}>
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
