// app/components/Header.js
'use client';

import { useWebSocket } from '@/context/WebSocketContext';

export default function Header() {
  const { username, currentRoom, roomInfo } = useWebSocket();
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">
            Decision Delegation Platform
          </h1>
          {currentRoom && roomInfo && (
            <span className="ml-4 text-gray-500">
              Room: {roomInfo.title}
            </span>
          )}
        </div>
        
        {username && (
          <div className="flex items-center">
            <span className="text-gray-700">
              Logged in as <span className="font-medium">{username}</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
}