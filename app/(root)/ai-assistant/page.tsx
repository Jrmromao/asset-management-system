'use client'
import React, {useState} from 'react'
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const AIAssistant = () => {
    const [message, setMessage] = useState('')

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-grow p-4 overflow-y-auto">
                {/* Here you would map through messages to display them */}
                <div className="mb-4 p-2 rounded-lg bg-green-100">
                    User: Hello!
                </div>
                <div className="mb-4 p-2 rounded-lg bg-blue-100">
                    AI: How can I help you today?
                </div>
            </div>
            <div className="flex items-center p-4 bg-white border-t border-gray-200">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow mr-2"
                />
                <Button onClick={() => console.log('Send message:', message)}>
                    Send
                </Button>
            </div>
        </div>
    )
}

export default AIAssistant
