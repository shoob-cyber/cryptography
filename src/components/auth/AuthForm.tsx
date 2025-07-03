
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Mail, ShieldCheck, Chrome, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MetaMaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.22 8.52L15.71 9.92C15.03 9.25 14.16 8.82 13.21 8.82C11.66 8.82 10.41 10.07 10.41 11.62C10.41 12.51 10.82 13.32 11.48 13.86L10.07 15.27C9.02 14.54 8.31 13.19 8.31 11.62C8.31 8.97 10.51 6.78 13.21 6.78C14.73 6.78 16.08 7.45 17.22 8.52ZM12 18.5C11.17 18.5 10.5 17.83 10.5 17C10.5 16.17 11.17 15.5 12 15.5C12.83 15.5 13.5 16.17 13.5 17C13.5 17.83 12.83 18.5 12 18.5Z" fill="currentColor"/>
  </svg>
);


export function AuthForm() {
  const { login, signup, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  const handleAuthAction = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (action === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    }
  };

  const handleGoogleLogin = async () => {
     setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    }
  };

  const handleMetaMaskConnect = async () => {
    setError("MetaMask connection is not fully integrated yet.");
  };

  return (
    <div className="flex items-center justify-center py-12 animate-fadeIn">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <ShieldCheck className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to BlockTalk</CardTitle>
          <CardDescription>Secure, decentralized communication.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={(e) => handleAuthAction('login', e)}>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="focus:ring-primary focus:border-primary" />
                  </div>
                  <Button type="submit" className="w-full transition-transform active:scale-95" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuthAction('signup', e)}>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="focus:ring-primary focus:border-primary" />
                  </div>
                  <Button type="submit" className="w-full transition-transform active:scale-95" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* Social Tab */}
            <TabsContent value="social">
              <div className="space-y-4 pt-4">
                <Button variant="outline" className="w-full transition-transform active:scale-95" onClick={handleGoogleLogin} disabled={loading}>
                  <Chrome className="mr-2 h-5 w-5" /> 
                  {loading ? "Connecting..." : "Continue with Google"}
                </Button>
                <Button variant="outline" className="w-full transition-transform active:scale-95" onClick={handleMetaMaskConnect} disabled={loading}>
                  <MetaMaskIcon /> 
                  <span className="ml-1">{loading ? "Connecting..." : "Connect MetaMask"}</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Select an option to get started.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
