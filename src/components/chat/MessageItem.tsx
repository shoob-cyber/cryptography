"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ExternalLink, Hash, CheckCircle2, Lock, Clock, AlertCircle, Loader2, ShieldQuestion, Fingerprint } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    if (hash.length <= length) return hash;
    const half = Math.floor(length / 2);
    return `${hash.substring(0, half)}...${hash.substring(hash.length - (length - half))}`;
  }

  const getStatusTextAndIcon = () => {
    switch (message.status) {
      case 'sending':
        return { text: 'Sending...', icon: <Loader2 size={12} className="animate-spin" /> };
      case 'sent':
        return { text: 'Sent', icon: <CheckCircle2 size={12} /> };
      case 'chain_pending':
        return { text: 'Blockchain Pending...', icon: <Clock size={12} className="text-yellow-500 animate-pulse" /> };
      case 'chain_confirmed':
        return { text: 'Blockchain Confirmed', icon: <CheckCircle2 size={12} className="text-green-500" /> };
      case 'chain_failed':
        return { text: 'Blockchain Failed', icon: <AlertCircle size={12} className="text-red-500" /> };
      case 'failed':
        return { text: 'Failed', icon: <AlertCircle size={12} className="text-red-500" /> };
      default:
        return { text: message.status || 'Status unknown', icon: <ShieldQuestion size={12} /> };
    }
  };

  const { text: statusText, icon: statusIcon } = getStatusTextAndIcon();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-end gap-2 max-w-[85%] sm:max-w-[75%] mb-4 group",
          isSender ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        <Avatar className="h-8 w-8 self-start mt-1 shadow">
          <AvatarImage src={message.avatar} alt={message.senderName || "User"} data-ai-hint={message.dataAiHint || "profile avatar"} />
          <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "p-3 rounded-xl shadow-md flex flex-col transition-all duration-200 group-hover:shadow-lg",
            isSender
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-card text-card-foreground rounded-tl-none border"
          )}
        >
          <p className="text-sm break-words">{message.decryptedText || message.text}</p>
          
          <div className="mt-2 text-xs opacity-80 space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  <Lock size={12} className="text-blue-400 dark:text-blue-300"/> 
                  <span>Illustrative Encryption</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align={isSender ? "end" : "start"}>
                <p className="text-xs">Message content uses illustrative Caesar cipher (not secure).</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  <Fingerprint size={12} className="text-purple-500 dark:text-purple-400" /> 
                  <span>{shortHash(message.messageHash, 16)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align={isSender ? "end" : "start"}>
                <p className="text-xs font-mono">Message Hash (SHA-256): {message.messageHash}</p>
              </TooltipContent>
            </Tooltip>

            {message.isChainLogged && message.transactionHash && (message.status === 'chain_confirmed' || message.status === 'chain_pending' || message.status === 'chain_failed') && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1.5 cursor-default", 
                      message.status === 'chain_confirmed' && "text-green-600 dark:text-green-400",
                      message.status === 'chain_pending' && "text-yellow-600 dark:text-yellow-400",
                      message.status === 'chain_failed' && "text-red-600 dark:text-red-400"
                    )}>
                      {message.status === 'chain_confirmed' && <CheckCircle2 size={12} />}
                      {message.status === 'chain_pending' && <Clock size={12} className="animate-pulse" />}
                      {message.status === 'chain_failed' && <AlertCircle size={12} />}
                      <span>{message.status === 'chain_confirmed' ? "On-chain" : message.status === 'chain_pending' ? "Chain Pending" : "Chain Failed"}: {shortHash(message.transactionHash)}</span>
                      {message.etherscanLink && message.status !== 'chain_failed' && (
                        <Link href={message.etherscanLink} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={12} className="ml-0.5" />
                        </Link>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align={isSender ? "end" : "start"}>
                    <p className="text-xs font-mono">Tx: {message.transactionHash}</p>
                    {message.mockGasFee && <p className="text-xs">Gas: {message.mockGasFee}</p>}
                    {message.mockBlockNumber && message.status === 'chain_confirmed' && <p className="text-xs">Block: #{message.mockBlockNumber}</p>}
                    {message.etherscanLink && message.status !== 'chain_failed' && <p className="text-xs">View on Etherscan</p>}
                     {message.status === 'chain_failed' && <p className="text-xs text-red-500">Transaction failed to confirm.</p>}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {message.isSigned && message.signature && (
              <Tooltip>
                <TooltipTrigger asChild>
                   <div className="flex items-center gap-1.5 cursor-default">
                      <Fingerprint size={12} className="text-indigo-500 dark:text-indigo-400" />
                      <span>Signed: {shortHash(message.signature, 16)}</span>
                   </div>
                </TooltipTrigger>
                 <TooltipContent side="bottom" align={isSender ? "end" : "start"}>
                    <p className="text-xs font-mono">Signature: {message.signature}</p>
                 </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <div className={cn(
              "text-xs mt-1.5 self-end flex items-center gap-1",
              isSender ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
            {statusIcon}
            <span>{statusText}</span>
            <span className="mx-1">&bull;</span>
            <span>{format(new Date(message.timestamp), "p")}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
