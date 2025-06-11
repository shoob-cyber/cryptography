
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

const CHAT_STORAGE_KEY_PREFIX = "blocktalk_chat_";

// --- Illustrative Cryptography (NOT SECURE) ---
const illustrativeCipher = (text: string, shift: number, encrypt: boolean): string => {
  // This is a simple Caesar cipher for demonstration purposes only.
  // It is NOT secure and should not be used for real encryption.
  return text
    .split('')
    .map(char => {
      let code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase letters
        code = encrypt ? ((code - 65 + shift) % 26) + 65 : ((code - 65 - shift + 26) % 26) + 65;
      } else if (code >= 97 && code <= 122) { // Lowercase letters
        code = encrypt ? ((code - 97 + shift) % 26) + 97 : ((code - 97 - shift + 26) % 26) + 97;
      }
      // Non-alphabetic characters are returned as is
      return String.fromCharCode(code);
    })
    .join('');
};

const mockEncrypt = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 30)); // Simulate async
  // IMPORTANT: This is a toy cipher for illustration ONLY. NOT SECURE.
  return `cipher_caesar_3(${illustrativeCipher(text, 3, true)})`;
};

const mockDecrypt = async (encryptedText: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 30)); // Simulate async
  // IMPORTANT: This is a toy cipher for illustration ONLY. NOT SECURE.
  const match = encryptedText.match(/^cipher_caesar_3\((.*)\)$/);
  if (match && match[1]) {
    return illustrativeCipher(match[1], 3, false);
  }
  // If it's not in the expected cipher format, return as is (e.g., if it was an old plain text message)
  if (!encryptedText.startsWith("cipher_caesar_3(")) {
    return encryptedText;
  }
  return encryptedText; 
};
// --- End Illustrative Cryptography ---

// --- Message Hashing ---
const generateMessageHash = async (text: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256-${hashHex.substring(0, 12)}...`; // Shorten for display
    } catch (error) {
      console.error("Error generating SHA-256 hash:", error);
    }
  }
  // Fallback hashing
  await new Promise(resolve => setTimeout(resolve, 20));
  let hashVal = 0;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5) - hashVal + text.charCodeAt(i);
    hashVal |= 0; // Convert to 32bit integer
  }
  return `fallback_hash(${Math.abs(hashVal).toString(16).substring(0,10)}...)`;
};
// --- End Message Hashing ---


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Mock contact
  const contact = {
    id: "contact-123",
    name: "Alice Wonderland",
    avatar: "https://placehold.co/100x100.png",
    dataAiHint: "female person" // data-ai-hint for contact avatar
  };
  
  const chatStorageKey = user ? `${CHAT_STORAGE_KEY_PREFIX}${user.id}_${contact.id}` : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Load messages from localStorage or set defaults
  useEffect(() => {
    if (user && chatStorageKey) {
      const loadMessages = async () => {
        let loadedMessages: Message[] = [];
        const storedMessagesRaw = localStorage.getItem(chatStorageKey);

        if (storedMessagesRaw) {
          try {
            const parsedMessages = JSON.parse(storedMessagesRaw).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp), // Ensure timestamp is a Date object
            }));
            loadedMessages = parsedMessages;
          } catch (e) {
            console.error("Failed to parse stored messages, clearing:", e);
            localStorage.removeItem(chatStorageKey); // Clear corrupted data
          }
        }

        if (loadedMessages.length === 0) {
          // No stored messages, or parsing failed, use defaults and encrypt them
          const defaultText1 = "Hello there! This is a default message from Alice.";
          const defaultText2 = `Hi Alice! This is a default reply from ${user.name || user.email?.split('@')[0] || "me"}.`;
          
          loadedMessages = [
            {
              id: "default-1",
              text: await mockEncrypt(defaultText1), // Encrypt default message
              sender: "other",
              senderId: contact.id,
              receiverId: user.id,
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              avatar: contact.avatar,
              dataAiHint: contact.dataAiHint,
              senderName: contact.name,
            },
            {
              id: "default-2",
              text: await mockEncrypt(defaultText2), // Encrypt default message
              sender: "user",
              senderId: user.id,
              receiverId: contact.id,
              timestamp: new Date(Date.now() - 1000 * 60 * 3),
              avatar: "https://placehold.co/100x100.png", 
              dataAiHint: "user profile", // data-ai-hint for user avatar
              senderName: user.name || user.email?.split('@')[0] || "You",
            },
          ];
           // Persist default messages if they were loaded
          localStorage.setItem(chatStorageKey, JSON.stringify(loadedMessages.map(msg => ({...msg, timestamp: msg.timestamp.toISOString() }))));
        }
        
        const decryptedMessages = await Promise.all(
          loadedMessages.map(async (msg) => ({
            ...msg,
            decryptedText: await mockDecrypt(msg.text), // Decrypt for display
          }))
        );
        setMessages(decryptedMessages);
      };
      loadMessages();
    }
  }, [user, chatStorageKey, contact.id, contact.name, contact.avatar, contact.dataAiHint]);


  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (user && chatStorageKey && messages.length > 0) {
      const messagesToStore = messages.map(msg => ({
        // Store only essential, non-derived data
        id: msg.id,
        text: msg.text, // Already encrypted
        sender: msg.sender,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        timestamp: msg.timestamp.toISOString(), // Store as ISO string
        messageHash: msg.messageHash,
        status: msg.status,
        avatar: msg.avatar,
        dataAiHint: msg.dataAiHint,
        senderName: msg.senderName,
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
      text: text, // Store original text temporarily for display before encryption
      decryptedText: text, // Show immediately
      sender: "user",
      senderId: user.id,
      receiverId: contact.id,
      timestamp: new Date(),
      status: 'sending',
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "user profile", // data-ai-hint for user avatar
      senderName: user.name || user.email?.split('@')[0] || "You",
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const encryptedText = await mockEncrypt(text);
      const messageHash = await generateMessageHash(encryptedText); // Hash the encrypted text

      console.log(`Simulating blockchain log: User ${user.id} to ${contact.id}, Hash: ${messageHash}, Content (Ciphered): ${encryptedText.substring(0,30)}...`);

      const sentMessage: Message = {
        ...tempMessage,
        text: encryptedText, // Store the encrypted text
        decryptedText: text, // Keep decrypted for current UI
        messageHash,
        status: 'sent', 
      };
      
      setMessages((prev) => prev.map(msg => msg.id === newMessageId ? sentMessage : msg));

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.map(msg => msg.id === newMessageId ? {...msg, status: 'failed'} : msg));
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
          Note: Encryption shown is illustrative (Caesar cipher) and NOT SECURE. For demo purposes only.
        </div>
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </CardContent>
    </Card>
  );
}

    