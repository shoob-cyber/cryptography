
"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthenticationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is not loading and a user exists, redirect them to the chat page.
    if (!loading && user) {
      router.push("/chat");
    }
  }, [user, loading, router]);

  // While Firebase is checking the auth state OR if we are redirecting, show a loading skeleton.
  if (loading || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-6 w-[200px]" />
      </div>
    );
  }

  // If not loading and there is no user, show the authentication form.
  return <AuthForm />;
}
