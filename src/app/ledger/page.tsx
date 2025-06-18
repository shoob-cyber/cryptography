
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import type { Message } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink, Hash, Clock, CheckCircle2, AlertCircle, ListOrdered } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Prefix for chat storage keys in localStorage
const CHAT_STORAGE_KEY_PREFIX = "blocktalk_chat_";

// Illustrative mock decryption - ensure this matches the one in chat/page.tsx or abstract it
const illustrativeCipher = (text: string, shift: number, encrypt: boolean): string => {
  return text
    .split('')
    .map(char => {
      let code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase letters
        code = encrypt ? ((code - 65 + shift) % 26) + 65 : ((code - 65 - shift + 26) % 26) + 65;
      } else if (code >= 97 && code <= 122) { // Lowercase letters
        code = encrypt ? ((code - 97 + shift) % 26) + 97 : ((code - 97 - shift + 26) % 26) + 97;
      }
      return String.fromCharCode(code);
    })
    .join('');
};

const mockDecrypt = async (encryptedText: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1)); // Minimal delay
  const match = encryptedText.match(/^cipher_caesar_3\\((.*)\\)$/);
  if (match && match[1]) {
    return illustrativeCipher(match[1], 3, false);
  }
   if (!encryptedText.startsWith("cipher_caesar_3(")) {
    return encryptedText; // Already decrypted or not encrypted with this scheme
  }
  return encryptedText; // Fallback if format is unexpected
};


export default function BlockchainLedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ledgerEntries, setLedgerEntries] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchLedgerData = async () => {
        setIsLoading(true);
        let allMessages: Message[] = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${CHAT_STORAGE_KEY_PREFIX}${user.id}_`)) {
              const storedMessagesRaw = localStorage.getItem(key);
              if (storedMessagesRaw) {
                const parsedMessages: Message[] = JSON.parse(storedMessagesRaw).map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp),
                }));
                
                const processedMessages = await Promise.all(
                  parsedMessages.map(async (msg) => {
                    let decryptedText = msg.text; // Default to original text
                    if (msg.text && msg.text.startsWith("cipher_caesar_3(")) {
                       try {
                          decryptedText = await mockDecrypt(msg.text);
                       } catch (e) { console.error("Decryption error for ledger", e); }
                    } else if (msg.decryptedText) { // If already decrypted from chat page
                        decryptedText = msg.decryptedText;
                    }
                    return { ...msg, decryptedText };
                  })
                );
                allMessages.push(...processedMessages);
              }
            }
          }
          
          const relevantEntries = allMessages.filter(
            (msg) => msg.transactionHash && ['chain_confirmed', 'chain_pending', 'chain_failed'].includes(msg.status || '')
          );
          
          relevantEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLedgerEntries(relevantEntries);
        } catch (error) {
          console.error("Failed to load ledger data:", error);
          // Handle error display if necessary
        }
        setIsLoading(false);
      };
      fetchLedgerData();
    }
  }, [user]);

  const getStatusInfo = (status?: Message['status']) => {
    switch (status) {
      case 'chain_pending':
        return { text: 'Pending', icon: <Clock size={16} className="text-yellow-500" />, color: "text-yellow-500", variant: "outline" as const };
      case 'chain_confirmed':
        return { text: 'Confirmed', icon: <CheckCircle2 size={16} className="text-green-500" />, color: "text-green-500", variant: "default" as const };
      case 'chain_failed':
        return { text: 'Failed', icon: <AlertCircle size={16} className="text-red-500" />, color: "text-red-500", variant: "destructive" as const };
      default:
        return { text: 'Unknown', icon: <AlertCircle size={16} className="text-gray-500" />, color: "text-gray-500", variant: "secondary" as const };
    }
  };
  
  const truncateHash = (hash?: string, start = 6, end = 4) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;
  };


  if (authLoading || !user || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2 border-b">
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListOrdered className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl font-headline">Blockchain Ledger View</CardTitle>
            </div>
            <CardDescription>
              A chronological log of all messages hashed and submitted to the (mock) blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ledgerEntries.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No blockchain ledger entries found.</p>
                <p className="text-sm">Send messages in the chat to see them appear here after (mock) blockchain logging.</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] sm:w-[200px]">Message Preview</TableHead>
                    <TableHead>Message Hash</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead className="text-center">Block #</TableHead>
                    <TableHead className="text-right">Gas Fee</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Explorer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => {
                    const statusInfo = getStatusInfo(entry.status);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{entry.decryptedText ? (entry.decryptedText.length > 25 ? entry.decryptedText.substring(0,25) + "..." : entry.decryptedText) : "Encrypted Content"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">{entry.decryptedText || "Original content not available or still encrypted."}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-xs cursor-default">{truncateHash(entry.messageHash, 8, 6)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{entry.messageHash}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                           <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{format(new Date(entry.timestamp), "MMM d, HH:mm:ss")}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{format(new Date(entry.timestamp), "PPpp")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {entry.transactionHash ? (
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-mono text-xs cursor-default">{truncateHash(entry.transactionHash)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{entry.transactionHash}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {entry.mockBlockNumber ? `#${entry.mockBlockNumber}` : "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{entry.mockGasFee ? entry.mockGasFee.split(" ")[0].substring(0,7) + "..." : "N/A"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{entry.mockGasFee || "Not Available"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Badge variant={statusInfo.variant} className="flex items-center gap-1.5 cursor-default">
                                {statusInfo.icon}
                                <span>{statusInfo.text}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Transaction {statusInfo.text.toLowerCase()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.etherscanLink ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link href={entry.etherscanLink} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={16} className="text-blue-500" />
                                      </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View on Etherscan</p>
                                </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
