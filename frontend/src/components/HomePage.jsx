// app/components/HomePage.js (updated)
'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import UserRegistration from './UserRegisteration';
import RoomsList from './RoomList';
import CreateRoom from './CreateRoom';
import Room from './Room';
import MessageLog from './MessageLog';
import Header from './Header';

export default function HomePage() {
  const { isConnected, username, currentRoom, messages, clearMessages } = useWebSocket();
  const [activeTab, setActiveTab] = useState('join'); // join or create

  // Clear UI state when connection is lost
  useEffect(() => {
    if (!isConnected) {
      setActiveTab('join');
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Decision Delegation Platform</h1>
          <div className="text-center">
            <div className="animate-pulse inline-block w-4 h-4 bg-red-500 rounded-full"></div>
            <p className="mt-2">Connecting to server...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <UserRegistration />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          {currentRoom ? (
            <Room />
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Welcome, {username}!</h2>
                
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('join')}
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'join' 
                          ? 'border-b-2 border-blue-500 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Join Room
                    </button>
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'create' 
                          ? 'border-b-2 border-blue-500 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Create Room
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    {activeTab === 'join' ? (
                      <RoomsList />
                    ) : (
                      <CreateRoom />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">System Messages</h2>
                  <button 
                    onClick={clearMessages}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <MessageLog messages={messages} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}