// app/components/MessageLog.js
'use client';

import { useRef, useEffect } from 'react';

export default function MessageLog({ messages }) {
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No messages yet
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto">
      <div className="space-y-2">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`text-sm ${
              message.type === 'error' 
                ? 'text-red-600' 
                : message.type === 'system' 
                  ? 'text-gray-600' 
                  : 'text-gray-800'
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}