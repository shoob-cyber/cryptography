export interface Message {
  id: string;
  text: string; // This would be the encrypted text
  decryptedText?: string; // Optional: for displaying decrypted content
  sender: 'user' | 'other';
  senderId: string; // ID of the sender (e.g., user.id or wallet address)
  receiverId: string; // ID of the receiver
  timestamp: Date;
  messageHash?: string; // Hash of the message content
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  avatar?: string; // URL to sender's avatar
  senderName?: string; // Name of the sender
}
