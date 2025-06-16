
"use client";

import { SecurityAdvisorForm } from "@/components/security/SecurityAdvisorForm";
import { MessageIntegrityChecker } from "@/components/security/MessageIntegrityChecker";
import { useAuth } from "@/hooks/use-auth-mock";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SecurityAdvisorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
     return (
      <div className="flex flex-col items-center justify-center pt-10">
        <Skeleton className="h-10 w-10 rounded-full mb-4" />
        <Skeleton className="h-8 w-1/2 md:w-1/3 mb-2" />
        <Skeleton className="h-6 w-3/4 md:w-1/2" />
        <Skeleton className="mt-8 h-[200px] w-full max-w-2xl" />
        <Skeleton className="mt-8 h-[200px] w-full max-w-2xl" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-12">
      <SecurityAdvisorForm />
      <Separator />
      <MessageIntegrityChecker />
    </div>
  );
}
