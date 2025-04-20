// app/components/DecisionsList.js (continued)
'use client';

export default function DecisionsList({ decisions }) {
  // Sort decisions by timestamp (newest first)
  const sortedDecisions = [...decisions].sort((a, b) => b.timestamp - a.timestamp);
  
  if (decisions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No decisions have been submitted yet
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedDecisions.map((decision, index) => (
        <div 
          key={index} 
          className="bg-gray-50 p-4 rounded-md"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{decision.username}</h3>
            <span className="text-xs text-gray-500">
              {new Date(decision.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{decision.text}</p>
        </div>
      ))}
    </div>
  );
}