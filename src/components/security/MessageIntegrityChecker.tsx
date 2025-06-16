
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyMessageOnBlockchain } from "@/lib/blockchainUtils";
import { generateMessageHash } from "@/app/chat/page"; 
import { Loader2, Terminal, ShieldCheck, ShieldAlert, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationResult {
  onChainHash: string;
  senderAddress: string;
  receiverAddress: string;
  timestamp: number;
  isVerified: boolean;
}

export function MessageIntegrityChecker() {
  const [messageContent, setMessageContent] = useState("");
  const [messageIdOrHash, setMessageIdOrHash] = useState(""); // User can input local message ID or its hash
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [localHash, setLocalHash] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageIdOrHash.trim() || !messageContent.trim()) {
      setError("Please provide both the message content and its identifier/hash.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);
    setLocalHash(null);

    try {
      // For this component, users will likely paste the *decrypted* content.
      // The hash stored on-chain should ideally be of the *encrypted* message.
      // For this demo, we'll hash the provided (assumed decrypted) content.
      // A real system would need to clarify if users should input original encrypted data or if the verification
      // process can re-encrypt the provided decrypted content using the known method before hashing.
      // For now, we assume the user is verifying based on the content they can read.
      const currentLocalHash = await generateMessageHash(messageContent);
      setLocalHash(currentLocalHash);

      // The `verifyMessageOnBlockchain` is a placeholder.
      // It would take an identifier (e.g., the message hash itself if it's a primary key on-chain)
      // and the local hash for comparison.
      const result = await verifyMessageOnBlockchain(messageIdOrHash, currentLocalHash);

      if (result) {
        setVerificationResult(result);
      } else {
        setError("Message not found on the blockchain or an error occurred during verification.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <SearchCheck className="h-7 w-7 text-primary" />
          Message Integrity Verification
        </CardTitle>
        <CardDescription>
          Verify the integrity of a message by comparing its local hash with the hash stored on the blockchain.
          (This is a conceptual demonstration using mocked blockchain interaction).
          Provide the message's original (decrypted) content and its transaction hash (or unique on-chain identifier).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="messageIdOrHash">Message Transaction Hash or On-Chain ID</Label>
            <Input
              id="messageIdOrHash"
              value={messageIdOrHash}
              onChange={(e) => setMessageIdOrHash(e.target.value)}
              placeholder="Enter transaction hash or on-chain message ID"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="messageContent">Original Message Content (Decrypted)</Label>
            <Textarea
              id="messageContent"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Paste the original (decrypted) content of the message here..."
              required
              className="min-h-[100px]"
              disabled={isLoading}
            />
             {localHash && (
              <p className="text-xs text-muted-foreground pt-1">Computed local hash: {localHash.substring(0,20)}...</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !messageContent.trim() || !messageIdOrHash.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Integrity"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Verification Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {verificationResult && (
          <Card className="mt-6 bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {verificationResult.isVerified ? (
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Status: </span>
                {verificationResult.isVerified ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">Integrity Verified</Badge>
                ) : (
                  <Badge variant="destructive">Integrity Check Failed</Badge>
                )}
              </div>
              <p><span className="font-medium">Local Hash:</span> {localHash?.substring(0,30)}...</p>
              <p><span className="font-medium">On-Chain Hash:</span> {verificationResult.onChainHash.substring(0,30)}...</p>
              <p><span className="font-medium">Sender (On-chain):</span> {verificationResult.senderAddress}</p>
              <p><span className="font-medium">Receiver (On-chain):</span> {verificationResult.receiverAddress}</p>
              <p><span className="font-medium">Timestamp (On-chain):</span> {new Date(verificationResult.timestamp).toLocaleString()}</p>
               {!verificationResult.isVerified && (
                 <p className="text-red-600 dark:text-red-400 font-medium">Warning: The local message hash does not match the hash stored on the blockchain. The message may have been tampered with, this is not the correct message content for the given identifier, or the incorrect identifier was provided.</p>
               )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
