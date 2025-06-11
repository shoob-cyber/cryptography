"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldQuestion, LogIn, LogOut, UserCircle } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6 text-sm font-medium">
          {user && (
            <>
              <Link
                href="/chat"
                className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              >
                <MessageCircle size={18} />
                Chat
              </Link>
              <Link
                href="/security-advisor"
                className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              >
                <ShieldQuestion size={18} />
                Security Advisor
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-foreground/80 hidden sm:inline">
                <UserCircle className="inline mr-1 h-5 w-5" />
                {user.email || user.walletAddress?.substring(0, 6) + "..."}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push("/")}>
               <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
