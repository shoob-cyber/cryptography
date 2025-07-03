
import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  avatar: string;
  dataAiHint?: string;
  walletAddress?: string;
}

export interface Message {
  id: string; // Document ID from Firestore
  text: string; // This will store the encrypted/ciphered text
  decryptedText?: string; // For UI display, derived from 'text'
  sender?: 'user' | 'other'; // This will be derived client-side
  senderId: string; // UID of the sender
  receiverId: string; // UID of the receiver
  timestamp: Timestamp; // Firestore Timestamp
  messageHash: string; // Hash of the (encrypted) message content
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'chain_pending' | 'chain_confirmed' | 'chain_failed';
  avatar?: string;
  dataAiHint?: string;
  senderName?: string;
  isChainLogged?: boolean;
  transactionHash?: string;
  etherscanLink?: string;
  isSigned?: boolean;
  signature?: string;
  mockGasFee?: string;
  mockBlockNumber?: number;
}


// ChatContact is essentially a user profile we can chat with
export interface ChatContact extends UserProfile {
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
}
