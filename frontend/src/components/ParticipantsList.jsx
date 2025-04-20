// app/components/ParticipantsList.js
'use client';

export default function ParticipantsList({ participants, adminId }) {
  return (
    <div>
      {participants.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No participants yet</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {participants.map(participant => (
            <li key={participant.id} className="py-3 flex items-center justify-between">
              <span>{participant.username}</span>
              {participant.id === adminId || participant.isAdmin ? (
                <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                  Admin
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}