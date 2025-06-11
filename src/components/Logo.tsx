"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <ShieldCheck className="h-8 w-8" />
      <span className="text-2xl font-headline font-semibold">BlockTalk</span>
    </Link>
  );
}
