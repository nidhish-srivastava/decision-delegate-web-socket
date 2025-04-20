// app/components/UserRegistration.js
'use client';

import { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export default function UserRegistration() {
  const [inputUsername, setInputUsername] = useState('');
  const { registerUser } = useWebSocket();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      registerUser(inputUsername.trim());
    }
  };
  
  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-center mb-6">Decision Delegation Platform</h1>
      <p className="mb-4 text-center text-gray-600">Register to start collaborating on decisions</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Choose a username
          </label>
          <input
            id="username"
            type="text"
            className="input"
            placeholder="Your username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            autoFocus
          />
        </div>
        
        <button 
          type="submit" 
          className="btn w-full"
          disabled={!inputUsername.trim()}
        >
          Continue
        </button>
      </form>
    </div>
  );
}