
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldQuestion, LogIn, LogOut, UserCircle, ListOrdered, BarChartHorizontalBig, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-medium">
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
              <Link
                href="/ledger"
                className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              >
                <ListOrdered size={18} />
                Ledger
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              >
                <BarChartHorizontalBig size={18} />
                Analytics
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user ? (
            <>
              <span className="text-sm text-foreground/80 hidden sm:inline">
                <UserCircle className="inline mr-1 h-5 w-5" />
                {user.name || user.email}
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
