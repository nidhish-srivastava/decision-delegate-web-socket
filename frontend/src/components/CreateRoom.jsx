// Modified CreateRoom.js to avoid potential issues
'use client';

import { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export default function CreateRoom() {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRoom, currentRoom } = useWebSocket();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    if (title.trim() && problem.trim()) {
      setIsSubmitting(true);
      createRoom(title.trim(), problem.trim());
      
      // Reset submission state after a delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };
  
  // If already in a room, show different UI
  if (currentRoom) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p>You are currently in a room. You need to leave it before creating a new one.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Create a New Room</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Room Title
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="Give your room a descriptive name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
            Decision Problem
          </label>
          <textarea
            id="problem"
            className="input min-h-32"
            placeholder="Describe the decision that needs to be made..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={5}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          className="btn w-full"
          disabled={!title.trim() || !problem.trim() || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
}