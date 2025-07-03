
"use client";

import type { ChatContact } from "@/types";
import { ChatListItem } from "./ChatListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";
import React from 'react';

interface ChatListProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onSelectContact: (contact: ChatContact) => void;
  onCreateNewChat: () => void;
}

export function ChatList({ contacts, selectedContact, onSelectContact, onCreateNewChat }: ChatListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="pl-10 h-10 rounded-lg bg-background focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow p-2">
        {filteredContacts.length > 0 ? (
          <div className="space-y-1">
            {filteredContacts.map((contact) => (
              <ChatListItem
                key={contact.uid}
                contact={contact}
                isSelected={selectedContact?.uid === contact.uid}
                onSelectContact={onSelectContact}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground p-4">No other users found.</p>
        )}
      </ScrollArea>
      <div className="p-2 border-t mt-auto">
        <Button variant="outline" className="w-full" onClick={onCreateNewChat}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  );
}
