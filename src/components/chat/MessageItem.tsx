
"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Hash, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isSender = message.senderId === currentUserId;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const shortHash = (hash?: string, length = 12) => {
    if (!hash) return "";
    return `${hash.substring(0, length / 2)}...${hash.substring(hash.length - length / 2)}`;
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 max-w-[85%] sm:max-w-[75%] mb-4", // Adjusted max-width
        isSender ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className="h-8 w-8 self-start mt-1"> {/* Aligned avatar with top of message box */}
        <AvatarImage src={message.avatar} alt={message.senderName || "User"} data-ai-hint={message.dataAiHint || "profile avatar"} />
        <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "p-3 rounded-xl shadow-md flex flex-col", // Use rounded-xl for softer corners
          isSender
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-card text-card-foreground rounded-tl-none border"
        )}
      >
        <p className="text-sm break-words">{message.decryptedText || message.text}</p>
        
        <div className="mt-2 text-xs opacity-80 space-y-1">
          <div className="flex items-center gap-1">
            <Hash size={12} /> 
            <span>{shortHash(message.messageHash)}</span>
          </div>

          {message.isChainLogged && message.transactionHash && (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-400" />
              <span>On-chain: {shortHash(message.transactionHash)}</span>
              {message.etherscanLink && (
                <Link href={message.etherscanLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <ExternalLink size={12} className="ml-1" />
                </Link>
              )}
            </div>
          )}
        </div>
        
        <p className={cn(
            "text-xs mt-1.5 self-end", // Align timestamp to the end of the bubble
            isSender ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
          {format(new Date(message.timestamp), "p")}
          {message.status === 'sending' && ' (sending...)'}
          {message.status === 'failed' && ' (failed)'}
        </p>
      </div>
    </div>
  );
}
