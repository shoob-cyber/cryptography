"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthenticationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/chat");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-6 w-[200px]" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }
  
  // If user is already logged in, this will be briefly shown before redirect
  return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Redirecting...</p>
      </div>
  );
}
