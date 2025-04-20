// app/components/JoinRoom.js (or whatever your join room component is)
'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export default function JoinRoom() {
  const { availableRooms, listRooms, joinRoom } = useWebSocket();
  const [isLoading, setIsLoading] = useState(true);

  // Only fetch room list once when component mounts
  useEffect(() => {
    // Set a flag to prevent duplicate calls
    if (isLoading) {
      listRooms();
      setIsLoading(false);
    }
    
    // Optional: Set up a refresh interval (not too frequent)
    const intervalId = setInterval(() => {
      listRooms();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [listRooms, isLoading]);

  const handleJoinRoom = (roomId) => {
    joinRoom(roomId);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Join a Room</h3>
      
      {isLoading ? (
        <p>Loading available rooms...</p>
      ) : availableRooms.length > 0 ? (
        <ul className="space-y-2">
          {availableRooms.map(room => (
            <li key={room.id} className="border p-3 rounded">
              <h4 className="font-medium">{room.title}</h4>
              <p className="text-sm text-gray-600">{room.problem}</p>
              <button 
                onClick={() => handleJoinRoom(room.id)}
                className="btn mt-2"
              >
                Join Room
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No rooms available. Create one!</p>
      )}
      
      {/* Optional: Manual refresh button */}
      <button 
        onClick={() => listRooms()}
        className="text-sm text-blue-600 mt-4"
      >
        Refresh room list
      </button>
    </div>
  );
}