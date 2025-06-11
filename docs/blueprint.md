# **App Name**: BlockTalk

## Core Features:

- User Authentication: User authentication via Firebase Auth (Google/Email) and MetaMask for Web3 wallet integration.
- Secure Chat Interface: Secure chat interface (React) for sending and receiving encrypted messages.
- Message Encryption: End-to-end message encryption using AES-256 for content and RSA-2048 for key exchange.  Keys are not stored on Firebase. Store ciphertext.
- Blockchain Logging: Smart Contract logging of message hashes, including sender, receiver, timestamp, and hash, on the Ethereum testnet (Mumbai).
- Message Display: Display message threads with decrypted content in a clear and readable format.
- Security Advisor: AI powered suggestion tool: Propose ways to improve the key exchange protocol based on current encryption best practices.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and security.
- Background color: Light gray (#F0F2F5) to provide a clean and unobtrusive backdrop.
- Accent color: Teal (#00BCD4) to highlight interactive elements and actions.
- Body and headline font: 'Inter' (sans-serif) for a modern and neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, consistent icons to represent actions and message status.
- Clear, intuitive layout with message bubbles and easy-to-use input fields.