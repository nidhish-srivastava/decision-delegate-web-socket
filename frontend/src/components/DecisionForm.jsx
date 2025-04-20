// app/components/DecisionForm.js
'use client';

import { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export default function DecisionForm() {
  const [decision, setDecision] = useState('');
  const { submitDecision, roomInfo } = useWebSocket();
  
  // Check if user has already submitted a decision
  const hasSubmitted = roomInfo?.decisions?.some(d => d.userId === roomInfo.userId);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision.trim()) {
      submitDecision(decision.trim());
      setDecision('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="decision" className="block text-sm font-medium text-gray-700 mb-1">
          Your Decision
        </label>
        <textarea
          id="decision"
          className="input min-h-32"
          placeholder="Enter your decision or recommendation..."
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          rows={5}
          disabled={hasSubmitted}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn"
        disabled={!decision.trim() || hasSubmitted}
      >
        {hasSubmitted ? 'Decision Submitted' : 'Submit Decision'}
      </button>
      
      {hasSubmitted && (
        <p className="mt-2 text-sm text-gray-600">
          You have already submitted a decision. You can see all decisions below.
        </p>
      )}
    </form>
  );
}