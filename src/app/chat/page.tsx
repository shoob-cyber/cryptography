
"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { Message } from "@/types";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { logMessageToBlockchain, getEtherscanLink } from "@/lib/blockchainUtils";
import { toast } from "@/hooks/use-toast";

const CHAT_STORAGE_KEY_PREFIX = "blocktalk_chat_";

// --- Illustrative Cryptography (NOT SECURE) ---
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

const mockEncrypt = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  return `cipher_caesar_3(${illustrativeCipher(text, 3, true)})`;
};

const mockDecrypt = async (encryptedText: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 30));
  const match = encryptedText.match(/^cipher_caesar_3\((.*)\)$/);
  if (match && match[1]) {
    return illustrativeCipher(match[1], 3, false);
  }
  // If it doesn't match the cipher prefix, return as is (might be already decrypted or unencrypted)
  if (!encryptedText.startsWith("cipher_caesar_3(")) {
    return encryptedText;
  }
  return encryptedText; // Fallback if somehow malformed
};
// --- End Illustrative Cryptography ---

// --- Message Hashing (SHA-256) ---
export const generateMessageHash = async (text: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error("Error generating SHA-256 hash:", error);
    }
  }
  // Fallback hashing (less secure, for environments without crypto.subtle or for very old data)
  await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async for consistency
  let hashVal = 0;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5) - hashVal + text.charCodeAt(i);
    hashVal |= 0; // Convert to 32bit integer
  }
  return `fallback_hash_${Math.abs(hashVal).toString(16)}`;
};
// --- End Message Hashing ---


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const contact = {
    id: "contact-123", // Example contact ID
    name: "Alice Wonderland",
    avatar: "https://placehold.co/100x100.png",
    dataAiHint: "female person"
  };
  
  const chatStorageKey = user ? `${CHAT_STORAGE_KEY_PREFIX}${user.id}_${contact.id}` : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && chatStorageKey) {
      const loadMessages = async () => {
        let loadedMessages: Message[] = [];
        const storedMessagesRaw = localStorage.getItem(chatStorageKey);

        if (storedMessagesRaw) {
          try {
            const parsedMessages = JSON.parse(storedMessagesRaw).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              messageHash: msg.messageHash || '', 
            }));
            loadedMessages = parsedMessages;
          } catch (e) {
            console.error("Failed to parse stored messages, clearing:", e);
            localStorage.removeItem(chatStorageKey);
          }
        }

        if (loadedMessages.length === 0) {
          const defaultText1 = "Hello there! This is a default message from Alice.";
          const defaultText2 = `Hi Alice! This is a default reply from ${user.name || user.email?.split('@')[0] || "me"}.`;
          
          const encryptedText1 = await mockEncrypt(defaultText1);
          const encryptedText2 = await mockEncrypt(defaultText2);

          loadedMessages = [
            {
              id: "default-1",
              text: encryptedText1,
              sender: "other",
              senderId: contact.id,
              receiverId: user.id,
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              avatar: contact.avatar,
              dataAiHint: contact.dataAiHint,
              senderName: contact.name,
              messageHash: await generateMessageHash(encryptedText1),
            },
            {
              id: "default-2",
              text: encryptedText2,
              sender: "user",
              senderId: user.id,
              receiverId: contact.id,
              timestamp: new Date(Date.now() - 1000 * 60 * 3),
              avatar: user.avatarUrl || "https://placehold.co/100x100.png",
              dataAiHint: "user profile",
              senderName: user.name || user.email?.split('@')[0] || "You",
              messageHash: await generateMessageHash(encryptedText2), 
            },
          ];
          localStorage.setItem(chatStorageKey, JSON.stringify(loadedMessages.map(msg => ({...msg, timestamp: msg.timestamp.toISOString() }))));
        }
        
        const processedMessages = await Promise.all(
          loadedMessages.map(async (msg) => ({
            ...msg,
            decryptedText: await mockDecrypt(msg.text),
            messageHash: msg.messageHash || await generateMessageHash(msg.text), 
          }))
        );
        setMessages(processedMessages);
      };
      loadMessages();
    }
  }, [user, chatStorageKey, contact.id, contact.name, contact.avatar, contact.dataAiHint]);

  useEffect(() => {
    if (user && chatStorageKey && messages.length > 0) {
      const messagesToStore = messages.map(msg => ({
        id: msg.id,
        text: msg.text, 
        sender: msg.sender,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        timestamp: msg.timestamp.toISOString(),
        messageHash: msg.messageHash,
        status: msg.status,
        avatar: msg.avatar,
        dataAiHint: msg.dataAiHint,
        senderName: msg.senderName,
        isChainLogged: msg.isChainLogged,
        transactionHash: msg.transactionHash,
        etherscanLink: msg.etherscanLink,
        isSigned: msg.isSigned,
        signature: msg.signature,
        mockGasFee: msg.mockGasFee,
        mockBlockNumber: msg.mockBlockNumber,
      }));
      localStorage.setItem(chatStorageKey, JSON.stringify(messagesToStore));
    }
  }, [messages, user, chatStorageKey]);

  const handleSendMessage = async (text: string) => {
    if (!user) return;
    setIsSending(true);

    const newMessageId = Date.now().toString();
    const tempMessage: Message = {
      id: newMessageId,
      text: text, 
      decryptedText: text, 
      sender: "user",
      senderId: user.id,
      receiverId: contact.id,
      timestamp: new Date(),
      status: 'sending',
      avatar: user.avatarUrl || "https://placehold.co/100x100.png",
      dataAiHint: "user profile",
      senderName: user.name || user.email?.split('@')[0] || "You",
      messageHash: await generateMessageHash(text), 
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const encryptedText = await mockEncrypt(text);
      const finalMessageHash = await generateMessageHash(encryptedText); 

      // Update message with encrypted text and final hash, status remains 'sending' or similar
      setMessages((prev) => prev.map(msg => 
        msg.id === newMessageId ? { ...msg, text: encryptedText, messageHash: finalMessageHash, status: 'sent' } : msg
      ));
      
      const shouldLogToBlockchain = true; 

      if (shouldLogToBlockchain) {
        // Indicate pending blockchain logging
        setMessages((prev) => prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'chain_pending' } : msg
        ));

        try {
          const senderAddress = user.walletAddress || user.id; 
          const receiverAddress = contact.id; 

          const blockchainLog = await logMessageToBlockchain({
            senderAddress,
            receiverAddress,
            messageHash: finalMessageHash,
            timestamp: tempMessage.timestamp.getTime(),
          });
          
          let etherscanLinkVal = undefined;
          if (blockchainLog.finalStatus === 'chain_confirmed' && blockchainLog.transactionHash) {
            etherscanLinkVal = await getEtherscanLink(blockchainLog.transactionHash);
            console.log(`Message hash logged to blockchain. Tx: ${blockchainLog.transactionHash}`);
            toast({ title: "Message Logged", description: `Tx: ${blockchainLog.transactionHash.substring(0,10)}... Confirmed!`});
          } else {
             toast({ title: "Blockchain Log Failed", description: "Could not log message to blockchain.", variant: "destructive" });
          }
          
          const finalSentMessage: Message = {
            ...tempMessage, // start with tempMessage to retain original decrypted text and other fields
            text: encryptedText,
            messageHash: finalMessageHash,
            status: blockchainLog.finalStatus,
            isChainLogged: blockchainLog.finalStatus === 'chain_confirmed',
            transactionHash: blockchainLog.transactionHash,
            etherscanLink: etherscanLinkVal,
            mockGasFee: blockchainLog.mockGasFee,
            mockBlockNumber: blockchainLog.mockBlockNumber,
          };
          setMessages((prev) => prev.map(msg => msg.id === newMessageId ? finalSentMessage : msg));

        } catch (chainError) {
          console.error("Blockchain logging error:", chainError);
          toast({ title: "Blockchain Error", description: "Failed to log message to blockchain.", variant: "destructive" });
          setMessages((prev) => prev.map(msg => msg.id === newMessageId ? {...msg, status: 'chain_failed'} : msg));
        }
      } else {
         // If not logging to blockchain, just set status to sent
         setMessages((prev) => prev.map(msg => 
          msg.id === newMessageId ? { ...msg, text: encryptedText, messageHash: finalMessageHash, status: 'sent' } : msg
        ));
      }
      
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.map(msg => msg.id === newMessageId ? {...msg, status: 'failed'} : msg));
      toast({ title: "Message Send Error", description: "Failed to encrypt or process message.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex items-center p-4 border-b">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="flex-grow p-4 space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4 ml-auto" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="p-4 border-t flex gap-2">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-10rem)] flex flex-col shadow-2xl overflow-hidden">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint={contact.dataAiHint}/>
            <AvatarFallback>{contact.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-medium">{contact.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
        <div className="text-xs text-center p-2 bg-secondary/50 text-muted-foreground">
          Note: Encryption shown is illustrative (Caesar cipher) and NOT SECURE. For demo purposes only. Message hashes are simulated on-chain.
        </div>
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </CardContent>
    </Card>
  );
}
