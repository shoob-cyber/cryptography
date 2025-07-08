
"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatList } from "@/components/chat/ChatList";
import type { Message, ChatContact, UserProfile } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { logMessageToBlockchain, getEtherscanLink } from "@/lib/blockchainUtils";
import { toast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  limit,
  setDoc
} from "firebase/firestore";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch contacts (other users) from Firestore
  useEffect(() => {
    if (!user) return;

    const usersCollectionRef = collection(db, 'users');
    // Fetch all users and filter client-side, as Firestore doesn't support '!=' queries.
    const q = query(usersCollectionRef);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList: ChatContact[] = [];
        querySnapshot.forEach((doc) => {
          // Filter out the current user
          if (doc.id !== user.uid) {
              const data = doc.data() as UserProfile;
              usersList.push({
                  ...data,
                  lastMessage: "Click to start chatting", // Placeholder
              });
          }
        });
        setContacts(usersList);
        if (!selectedContact && usersList.length > 0) {
          // Find if the previously selected contact is still in the list
          const prevSelected = usersList.find(c => c.uid === selectedContact?.uid);
          // Do not auto-select a contact
          // setSelectedContact(prevSelected || usersList[0]);
        }
    });

    return () => unsubscribe();
  }, [user]);


  // Listen for real-time messages for the selected chat
  useEffect(() => {
    if (!user || !selectedContact) {
      setMessages([]);
      return;
    };

    const getChatId = (uid1: string, uid2: string) => {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    }
    const chatId = getChatId(user.uid, selectedContact.uid);
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const loadedMessages: Message[] = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const decryptedText = await mockDecrypt(data.text);
            loadedMessages.push({
                id: doc.id,
                ...data,
                sender: data.senderId === user.uid ? 'user' : 'other',
                decryptedText,
                timestamp: data.timestamp,
            } as Message);
        }
        setMessages(loadedMessages);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      toast({ title: "Error", description: "Could not fetch messages.", variant: "destructive" });
    });
    
    return () => unsubscribe();
  }, [user, selectedContact]); 

  const handleSendMessage = async (text: string) => {
    if (!user || !selectedContact || isSending) return;

    setIsSending(true);

    const getChatId = (uid1: string, uid2: string) => uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    const chatId = getChatId(user.uid, selectedContact.uid);
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    
    const chatDocRef = doc(db, 'chats', chatId);
    await setDoc(chatDocRef, { 
      participants: [user.uid, selectedContact.uid],
      lastUpdated: serverTimestamp()
    }, { merge: true });

    try {
        const encryptedText = await mockEncrypt(text);
        const finalMessageHash = await generateMessageHash(encryptedText);

        const newMessageRef = await addDoc(messagesCollectionRef, {
            text: encryptedText,
            senderId: user.uid,
            receiverId: selectedContact.uid,
            timestamp: serverTimestamp(),
            messageHash: finalMessageHash,
            status: 'chain_pending' // Initial status
        });
        
        // The real-time listener will display the message with 'pending' status.
        // Now, perform the mock blockchain logging and update the message doc.
        try {
            const blockchainLog = await logMessageToBlockchain({
                senderAddress: user.walletAddress || user.uid,
                receiverAddress: selectedContact.uid,
                messageHash: finalMessageHash,
                timestamp: Date.now(),
            });
            
            const etherscanLinkVal = blockchainLog.finalStatus === 'chain_confirmed' && blockchainLog.transactionHash
                ? await getEtherscanLink(blockchainLog.transactionHash)
                : undefined;
            
            await updateDoc(newMessageRef, {
                status: blockchainLog.finalStatus,
                isChainLogged: blockchainLog.finalStatus === 'chain_confirmed',
                transactionHash: blockchainLog.transactionHash,
                etherscanLink: etherscanLinkVal,
                mockGasFee: blockchainLog.mockGasFee,
                mockBlockNumber: blockchainLog.mockBlockNumber,
            });

            if (blockchainLog.finalStatus === 'chain_confirmed') {
                toast({ title: "Message Logged", description: `Tx: ${blockchainLog.transactionHash.substring(0,10)}... Confirmed!`});
            } else if (blockchainLog.finalStatus === 'chain_failed') {
                toast({ title: "Blockchain Log Failed", description: "Could not log message.", variant: "destructive" });
            }
        } catch (chainError) {
            console.error("Blockchain logging error:", chainError);
            toast({ title: "Blockchain Error", description: "Failed to log message.", variant: "destructive" });
            await updateDoc(newMessageRef, { status: 'chain_failed' });
        }

    } catch (error) {
        console.error("Failed to send message:", error);
        toast({ title: "Message Send Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
        setIsSending(false);
    }
  };


  const handleSelectContact = async (contact: ChatContact) => {
    if (!user) return;
    setSelectedContact(contact); // Set state immediately for responsiveness
    
    // Proactively create the chat document to ensure security rules pass for the listener.
    const getChatId = (uid1: string, uid2: string) => uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    const chatId = getChatId(user.uid, contact.uid);
    const chatDocRef = doc(db, 'chats', chatId);

    try {
      await setDoc(chatDocRef, { 
        participants: [user.uid, contact.uid],
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Error ensuring chat document exists:", e);
      toast({
        title: "Error",
        description: "Could not initialize chat session.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewChat = async () => {
    // This function creates a new "demo" user in Firestore, which will then appear in the contact lists of all users.
    if (!user) return;

    try {
        const usersCollectionRef = collection(db, 'users');
        const newUserDocRef = doc(usersCollectionRef); // Create a new doc reference with a unique ID

        const newContact: UserProfile = {
            uid: newUserDocRef.id,
            name: `Demo User ${Math.floor(Math.random() * 1000)}`,
            email: `demo-${newUserDocRef.id}@example.com`,
            avatar: `https://placehold.co/100x100.png`,
            dataAiHint: 'profile person',
            walletAddress: `0xDEMO${newUserDocRef.id.substring(0, 10)}`
        };

        await setDoc(newUserDocRef, {
            ...newContact,
            createdAt: serverTimestamp(),
        });

        // The real-time listener will automatically add this new user to the `contacts` list.
        // We select the contact, which also ensures the chat document is created.
        await handleSelectContact({
            ...newContact,
            lastMessage: "Click to start chatting",
        });
        
        toast({
            title: "Demo User Created",
            description: `You can now chat with ${newContact.name}.`,
        });

    } catch (error) {
        console.error("Error creating new demo user:", error);
        toast({
            title: "Error",
            description: "Could not create a new demo user.",
            variant: "destructive",
        });
    }
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
          onCreateNewChat={handleCreateNewChat}
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
                <Avatar className="shadow">
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} data-ai-hint={selectedContact.dataAiHint}/>
                  <AvatarFallback>{selectedContact.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg font-medium">{selectedContact.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 text-xs text-center p-2 bg-yellow-100 dark:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300 border-b border-yellow-300 dark:border-yellow-700/50">
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
