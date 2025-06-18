
"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatList } from "@/components/chat/ChatList";
import type { Message, ChatContact } from "@/types";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { logMessageToBlockchain, getEtherscanLink } from "@/lib/blockchainUtils";
import { toast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

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
  const match = encryptedText.match(/^cipher_caesar_3\\((.*)\\)$/);
  if (match && match[1]) {
    return illustrativeCipher(match[1], 3, false);
  }
  if (!encryptedText.startsWith("cipher_caesar_3(")) {
    return encryptedText;
  }
  return encryptedText; 
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
  await new Promise(resolve => setTimeout(resolve, 20)); 
  let hashVal = 0;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5) - hashVal + text.charCodeAt(i);
    hashVal |= 0; 
  }
  return `fallback_hash_${Math.abs(hashVal).toString(16)}`;
};
// --- End Message Hashing ---

const initialContacts: ChatContact[] = [
  {
    id: "contact-alice-123",
    name: "Alice Wonderland",
    avatar: "https://placehold.co/100x100.png",
    dataAiHint: "female person",
    lastMessage: "Thinking about cryptography...",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    id: "contact-bob-456",
    name: "Bob The Builder",
    avatar: "https://placehold.co/100x100.png",
    dataAiHint: "male construction",
    lastMessage: "Can we secure it?",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "contact-charlie-789",
    name: "Charlie Brown",
    avatar: "https://placehold.co/100x100.png",
    dataAiHint: "boy character",
    lastMessage: "Good grief!",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 24,
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);

  const chatStorageKey = user && selectedContact ? `${CHAT_STORAGE_KEY_PREFIX}${user.id}_${selectedContact.id}` : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [user, contacts, selectedContact]);

  useEffect(() => {
    if (user && selectedContact && chatStorageKey) {
      const loadMessages = async () => {
        setMessages([]); // Clear messages when contact changes before loading new ones
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
          // Create default messages specific to the selected contact
          const defaultText1 = `Hello there! This is a default message from ${selectedContact.name}.`;
          const defaultText2 = `Hi ${selectedContact.name}! This is a default reply from ${user.name || user.email?.split('@')[0] || "me"}.`;
          
          const encryptedText1 = await mockEncrypt(defaultText1);
          const encryptedText2 = await mockEncrypt(defaultText2);

          loadedMessages = [
            {
              id: `default-${selectedContact.id}-1`,
              text: encryptedText1,
              sender: "other",
              senderId: selectedContact.id,
              receiverId: user.id,
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              avatar: selectedContact.avatar,
              dataAiHint: selectedContact.dataAiHint,
              senderName: selectedContact.name,
              messageHash: await generateMessageHash(encryptedText1),
            },
            {
              id: `default-${selectedContact.id}-2`,
              text: encryptedText2,
              sender: "user",
              senderId: user.id,
              receiverId: selectedContact.id,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedContact, chatStorageKey]); // Note: Removed dependencies that might cause excessive reloads

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
    if (!user || !selectedContact) return;
    setIsSending(true);

    const newMessageId = Date.now().toString();
    const tempMessage: Message = {
      id: newMessageId,
      text: text, 
      decryptedText: text, 
      sender: "user",
      senderId: user.id,
      receiverId: selectedContact.id,
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

      setMessages((prev) => prev.map(msg => 
        msg.id === newMessageId ? { ...msg, text: encryptedText, messageHash: finalMessageHash, status: 'sent' } : msg
      ));
      
      const shouldLogToBlockchain = true; 

      if (shouldLogToBlockchain) {
        setMessages((prev) => prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'chain_pending' } : msg
        ));

        try {
          const senderAddress = user.walletAddress || user.id; 
          const receiverAddress = selectedContact.id; 

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
            ...tempMessage,
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

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedContact(contact);
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md p-4 space-y-4">
          <Skeleton className="h-10 w-10 rounded-full mr-3 self-center" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.16))] rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden">
      {/* Sidebar for Chat List */}
      <div className="w-[280px] md:w-[320px] lg:w-[360px] flex-shrink-0">
        <ChatList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-background">
        {!selectedContact ? (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            <p>Select a chat to start messaging.</p>
          </div>
        ) : (
          <>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} data-ai-hint={selectedContact.dataAiHint}/>
                  <AvatarFallback>{selectedContact.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg font-medium">{selectedContact.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 text-xs text-center p-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-b border-yellow-300 dark:border-yellow-700">
                <ShieldAlert size={16} className="shrink-0"/>
                <span>Encryption shown is illustrative (Caesar cipher) and NOT SECURE. For demo purposes only. Message hashes are simulated on-chain.</span>
              </div>
              <MessageList messages={messages} />
              <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
            </CardContent>
          </>
        )}
      </div>
    </div>
  );
}
