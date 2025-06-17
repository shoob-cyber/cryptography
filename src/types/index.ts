
export interface Message {
  id: string;
  text: string; // This will store the encrypted/ciphered text
  decryptedText?: string; // For UI display, derived from 'text'
  sender: 'user' | 'other';
  senderId: string;
  receiverId: string;
  timestamp: Date;
  messageHash: string; // Hash of the (encrypted) message content - will always be present
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'chain_pending' | 'chain_confirmed' | 'chain_failed';
  avatar?: string;
  dataAiHint?: string; // For placeholder image generation
  senderName?: string;
  isChainLogged?: boolean; // True if the message hash is logged on the blockchain
  transactionHash?: string; // Blockchain transaction hash
  etherscanLink?: string; // Link to view the transaction on Etherscan
  isSigned?: boolean; // True if the message was signed by the sender's wallet
  signature?: string; // The message signature
  mockGasFee?: string; // Simulated gas fee for the transaction
  mockBlockNumber?: number; // Simulated block number of confirmation
}

