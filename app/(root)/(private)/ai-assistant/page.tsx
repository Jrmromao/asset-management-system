"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AIAssistant = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow p-4 overflow-y-auto"></div>
      <div className="flex items-center p-4 bg-white border-t border-gray-200">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow mr-2"
        />
        <Button onClick={() => console.log("Send message:", message)}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
