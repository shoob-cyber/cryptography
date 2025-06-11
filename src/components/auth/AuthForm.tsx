"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth-mock";
import { Mail, ShieldCheck, Chrome } from "lucide-react"; // Chrome for Google like icon

// Placeholder for MetaMask icon
const MetaMaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.22 8.52L15.71 9.92C15.03 9.25 14.16 8.82 13.21 8.82C11.66 8.82 10.41 10.07 10.41 11.62C10.41 12.51 10.82 13.32 11.48 13.86L10.07 15.27C9.02 14.54 8.31 13.19 8.31 11.62C8.31 8.97 10.51 6.78 13.21 6.78C14.73 6.78 16.08 7.45 17.22 8.52ZM12 18.5C11.17 18.5 10.5 17.83 10.5 17C10.5 16.17 11.17 15.5 12 15.5C12.83 15.5 13.5 16.17 13.5 17C13.5 17.83 12.83 18.5 12 18.5Z" fill="currentColor"/>
  </svg>
);


export function AuthForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('email', { email, password });
  };

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleMetaMaskConnect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // For mock, we'll just simulate this.
        // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // login('metamask', { wallet: accounts[0] });
        login('metamask', { wallet: '0x123...abc' }); // Mock wallet address
      } catch (error) {
        console.error("MetaMask connection failed", error);
        // Handle error (e.g., show toast)
      }
    } else {
      console.log('MetaMask is not installed!');
      // Handle MetaMask not installed (e.g., show toast or link to install)
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to BlockTalk</CardTitle>
          <CardDescription>Secure, decentralized communication.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social & Wallet</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login with Email"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="social">
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                  <Chrome className="mr-2 h-5 w-5" /> 
                  {loading ? "Connecting..." : "Sign in with Google"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleMetaMaskConnect} disabled={loading}>
                  <MetaMaskIcon /> 
                  <span className="ml-2">{loading ? "Connecting..." : "Connect MetaMask"}</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            New here? Sign up options are available.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
