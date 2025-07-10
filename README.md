# BlockTalk - Real-Time Secure Messaging Prototype

## Overview

BlockTalk is a dynamic and feature-rich web application that serves as a high-fidelity prototype for a secure, decentralized communication platform. It combines a real-time chat interface, powered by **Firebase**, with simulated blockchain interactions to demonstrate concepts of message integrity, transaction logging, and data verification.

This project is designed to showcase a modern, full-stack application architecture using Next.js, React, TypeScript, and Firebase, complete with a suite of interactive tools and dashboards.

## Key Features

### 1. Secure Authentication & Real-Time Chat
- **Firebase-Powered:**
  - **Real-Time Messaging:** Live, multi-user chat backed by Cloud Firestore. Messages are sent and received instantly across different devices.
  - **Secure Authentication:** Robust user login and sign-up using Firebase Authentication (Email/Password and Google Sign-In).
  - **User Profiles:** Each user has a profile with a name and avatar, stored in Firestore.
- **Dynamic Chat Creation:** Users can create new "demo" contacts on the fly, which are added to Firestore and become available for all users to chat with.

### 2. Blockchain-Integrated Messaging (Conceptual)
- **Illustrative End-to-End Encryption:** Demonstrates the concept of encryption with a simple Caesar cipher (Note: **This is for illustrative purposes only and is NOT secure**).
- **Message Hashing:** Before being sent, every message's content is hashed (SHA-256) to create a unique digital fingerprint.
- **Tamper-Evident Logging:** The message hash is then *simulated* to be logged on a mock blockchain, complete with a transaction hash, status, and mock gas fees, demonstrating how blockchain can ensure message integrity.

### 3. Comprehensive Feature Suite
- **Ledger Viewer:** A block explorer-style interface that provides a chronological log of all messages submitted to the (mock) blockchain. It displays transaction details, hashes, timestamps, and confirmation status.
- **Analytics Dashboard:** A real-time dashboard visualizing messaging activity and (mock) blockchain performance. It includes:
  - Animated counters for key metrics (Total Messages, Hashes Logged).
  - A pie chart showing the distribution of confirmed, pending, and failed transactions.
  - Display of the user's wallet address and the (mock) smart contract address.
- **AI Security Advisor:** An AI-powered tool (using Genkit) that provides expert recommendations for improving cryptographic protocols.
- **Message Integrity Checker:** A tool to verify if a message has been tampered with by comparing its locally computed hash against the (mock) on-chain record.

### 4. Modern UI/UX
- **Light/Dark Mode:** A theme toggle for user preference.
- **Responsive Design:** A clean, modern interface that works seamlessly on both desktop and mobile.
- **Enhanced Components:** Features improved chat bubbles, tooltips with icons for metadata, and animated UI elements.
- **Floating AI Assistant:** A placeholder floating icon for a future interactive AI assistant.

## Technical Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Frontend:** React, Tailwind CSS
- **UI Components:** ShadCN UI
- **Backend & Real-Time:** Firebase (Authentication, Cloud Firestore)
- **Generative AI:** Google's Genkit
- **Deployment:** Pre-configured for Firebase Hosting with GitHub Actions CI/CD.

## Security Notice

⚠️ **Important:** This is a conceptual prototype. The encryption used is for demonstration purposes only and is **NOT SECURE**. The blockchain interactions are **simulated** and do not connect to a real blockchain network. This project should not be used for sending sensitive information.

## Getting Started

1.  **Login/Sign Up:** Use the authentication form to create an account or log in with Email/Password or Google.
2.  **Start Chatting:** Select a user from the contact list or create a new demo user to start a real-time conversation.
3.  **Explore the Tools:**
    -   Check the **Ledger** to see your messages' (mock) blockchain history.
    -   Visit the **Analytics** dashboard for a visual overview of activity.
    -   Use the **Security Advisor** to interact with the AI.
    -   Verify a message's integrity with the **Message Integrity Checker**.