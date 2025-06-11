"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchSecurityRecommendations } from "@/app/security-advisor/actions";
import { Loader2, Terminal, ListChecks } from "lucide-react";
import type { SecurityRecommendationsOutput } from "@/ai/flows/security-advisor";

export function SecurityAdvisorForm() {
  const [protocol, setProtocol] = useState("");
  const [recommendations, setRecommendations] = useState<SecurityRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const result = await fetchSecurityRecommendations({ keyExchangeProtocol: protocol });

    if (result.success && result.data) {
      setRecommendations(result.data);
    } else {
      setError(result.error || "Failed to get recommendations.");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <ListChecks className="h-7 w-7 text-primary" />
          AI Security Advisor
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to improve your key exchange protocol based on current encryption best practices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="protocol" className="font-medium">Current Key Exchange Protocol</Label>
            <Textarea
              id="protocol"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="Describe your current key exchange protocol (e.g., Diffie-Hellman with RSA signatures, specific elliptic curves used, etc.)"
              required
              className="min-h-[100px] font-code"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Get Recommendations"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations && recommendations.recommendations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-headline mb-3">Recommendations:</h3>
            <Card className="bg-secondary/50 p-4">
              <ul className="space-y-3 list-disc list-inside text-sm">
                {recommendations.recommendations.map((rec, index) => (
                  <li key={index} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}
        {recommendations && recommendations.recommendations.length === 0 && (
            <Alert className="mt-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>No specific recommendations</AlertTitle>
                <AlertDescription>The AI couldn't find specific improvement recommendations based on the provided input, or the protocol is already considered robust.</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
