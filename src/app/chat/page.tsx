"use client";

import { useState, useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { Message } from "@/types";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Mock encryption/decryption and other backend functions
const mockEncrypt = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return `encrypted(${text})`;
};

const mockDecrypt = async (encryptedText: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  if (encryptedText.startsWith("encrypted(")) {
    return encryptedText.substring(10, encryptedText.length - 1);
  }
  return encryptedText; // Should not happen
};

const mockGenerateHash = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  return `hash(${text.substring(0,10)}...)`;
};


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
    dataAiHint: "female person"
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Load initial messages or messages for current chat (mocked)
  useEffect(() => {
    if(user){
      const loadMessages = async () => {
        const initialMessages: Message[] = [
          {
            id: "1",
            text: "encrypted(Hello there!)",
            sender: "other",
            senderId: contact.id,
            receiverId: user.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            avatar: contact.avatar,
            senderName: contact.name,
          },
          {
            id: "2",
            text: "encrypted(Hi! How are you?)",
            sender: "user",
            senderId: user.id,
            receiverId: contact.id,
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            avatar: "https://placehold.co/100x100.png", // User's avatar
            dataAiHint: "male person",
            senderName: user.name || user.email?.split('@')[0] || "You",
          },
        ];
        
        const decryptedMessages = await Promise.all(
          initialMessages.map(async (msg) => ({
            ...msg,
            decryptedText: await mockDecrypt(msg.text),
          }))
        );
        setMessages(decryptedMessages);
      };
      loadMessages();
    }
  }, [user]);


  const handleSendMessage = async (text: string) => {
    if (!user) return;
    setIsSending(true);

    const newMessageId = Date.now().toString();
    const tempMessage: Message = {
      id: newMessageId,
      text: text, // Store original text temporarily for display
      decryptedText: text, // Show immediately
      sender: "user",
      senderId: user.id,
      receiverId: contact.id,
      timestamp: new Date(),
      status: 'sending',
      avatar: "https://placehold.co/100x100.png", // User's avatar
      dataAiHint: "male person",
      senderName: user.name || user.email?.split('@')[0] || "You",
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const encryptedText = await mockEncrypt(text);
      const messageHash = await mockGenerateHash(text); // Or hash of encryptedText

      // Simulate blockchain logging and storage
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const sentMessage: Message = {
        ...tempMessage,
        text: encryptedText,
        decryptedText: text, // Keep decrypted for UI
        messageHash,
        status: 'sent', // Or 'delivered' after confirmation
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
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </CardContent>
    </Card>
  );
}
