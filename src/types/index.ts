
export interface Message {
  id: string;
  text: string; // This will store the encrypted/ciphered text
  decryptedText?: string; // For UI display, derived from 'text'
  sender: 'user' | 'other';
  senderId: string; 
  receiverId: string; 
  timestamp: Date;
  messageHash?: string; // Hash of the (encrypted) message content
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  avatar?: string; 
  dataAiHint?: string; // For placeholder image generation
  senderName?: string; 
}

    