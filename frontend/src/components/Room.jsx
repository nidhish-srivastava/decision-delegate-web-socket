// app/components/Room.js
'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import DecisionForm from './DecisionForm';
import ParticipantsList from './ParticipantsList';
import DecisionsList from './DecisionsList';

export default function Room() {
  const { roomInfo, currentRoom, isAdmin, leaveRoom, getRoomInfo } = useWebSocket();
  
  useEffect(() => {
    if (currentRoom) {
      // Get initial room info
      getRoomInfo(currentRoom);
      
      // Set up interval to refresh room info
      const interval = setInterval(() => {
        getRoomInfo(currentRoom);
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentRoom, getRoomInfo]);
  
  if (!roomInfo) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4">Loading room information...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{roomInfo.title}</h1>
          <p className="text-gray-600">
            {isAdmin ? 'You are the admin of this room' : `Room admin: ${roomInfo.admin}`}
          </p>
        </div>
        <button 
          onClick={leaveRoom}
          className="btn-secondary"
        >
          Leave Room
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Decision Problem</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>{roomInfo.problem}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Submit Your Decision</h2>
            <DecisionForm />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Decisions</h2>
            <DecisionsList decisions={roomInfo.decisions || []} />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Participants</h2>
            <ParticipantsList 
              participants={roomInfo.participants || []} 
              adminId={isAdmin ? 'you' : roomInfo.admin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}