"use client";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react"; // Or any other suitable icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function FloatingAIButton() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // In a real scenario, this would trigger an AI interaction
  const handleAIClick = () => {
    console.log("AI Assistant button clicked. Placeholder for interaction.");
    // For now, let's toggle a sheet as a placeholder
    setIsSheetOpen(true); 
  };

  return (
    <TooltipProvider>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
                <Button
                variant="default"
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transform transition-all hover:scale-105 active:scale-95"
                onClick={handleAIClick}
                aria-label="AI Assistant"
                >
                <MessageSquarePlus size={24} />
                </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" align="center">
            <p>AI Assistant (Coming Soon)</p>
          </TooltipContent>
        </Tooltip>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>AI Assistant</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              This is a placeholder for the AI Assistant. 
              Future interactions will appear here.
            </p>
            {/* Placeholder for AI chat interface */}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
