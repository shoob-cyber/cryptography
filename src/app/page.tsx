
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

  // user will be null here if not logged in
  if (!user) {
    return <AuthForm />;
  }

  // If user is logged in but router hasn't pushed yet, show loading
  return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-6 w-[200px]" />
      </div>
  );
}
