'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const socketRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const isUnmounted = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([]);

  const connect = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setMessages(prev => [...prev, { type: 'system', text: 'Connected to server' }]);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
      setMessages(prev => [...prev, { type: 'system', text: 'Disconnected from server' }]);

      if (!isUnmounted.current) {
        reconnectTimeout.current = setTimeout(() => {
          if (document.visibilityState === 'visible') {
            connect(); // Reconnect
          }
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', text: 'Connection error' }]);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', data);

        switch (data.type) {
          case 'connected':
            setUserId(data.userId);
            setMessages(prev => [...prev, { type: 'system', text: data.message }]);
            break;

          case 'registered':
            setUsername(data.username);
            setMessages(prev => [...prev, { type: 'system', text: `Registered as ${data.username}` }]);
            break;

          case 'room_created':
          case 'room_joined':
            setCurrentRoom(data.roomId);
            setRoomInfo({
              id: data.roomId,
              title: data.title,
              problem: data.problem,
              participants: [],
              decisions: []
            });
            setIsAdmin(data.isAdmin ?? true);
            setMessages(prev => [...prev, { type: 'system', text: `${data.type === 'room_created' ? 'Room created' : 'Joined room'}: ${data.title}` }]);
            break;

          case 'room_left':
          case 'room_closed':
            setCurrentRoom(null);
            setRoomInfo(null);
            setIsAdmin(false);
            setMessages(prev => [...prev, { type: 'system', text: data.message || 'Room left' }]);
            break;

          case 'room_list':
          case 'room_list_updated':
            setAvailableRooms(data.rooms);
            break;

          case 'room_info':
            setRoomInfo(data);
            setIsAdmin(data.isAdmin);
            break;

          case 'participant_joined':
            setMessages(prev => [...prev, { type: 'system', text: `${data.username} joined the room` }]);
            setRoomInfo(prev => {
              if (!prev) return prev;
              if (prev.participants.some(p => p.id === data.userId)) return prev;
              return {
                ...prev,
                participants: [...prev.participants, { id: data.userId, username: data.username }]
              };
            });
            break;

          case 'participant_left':
            setMessages(prev => [...prev, { type: 'system', text: `${data.username} left the room` }]);
            setRoomInfo(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                participants: prev.participants.filter(p => p.id !== data.userId)
              };
            });
            break;

          case 'decision_submitted':
            setMessages(prev => [...prev, { type: 'system', text: 'Your decision has been submitted' }]);
            break;

          case 'decisions_updated':
            setRoomInfo(prev => (prev ? { ...prev, decisions: data.decisions } : prev));
            break;

          case 'error':
            setMessages(prev => [...prev, { type: 'error', text: data.message }]);
            break;

          default:
            console.warn('Unhandled message type:', data);
        }
      } catch (error) {
        console.error('Message parse error:', error);
      }
    };
  };

  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      isUnmounted.current = true;
      socketRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const sendMessage = (type, data = {}) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      setMessages(prev => [...prev, { type: 'error', text: 'Not connected to server' }]);
    }
  };

  const registerUser = (username) => sendMessage('register', { username });
  const createRoom = (title, problem) => sendMessage('create_room', { title, problem });
  const joinRoom = (roomId) => sendMessage('join_room', { roomId });
  const leaveRoom = () => sendMessage('leave_room');
  const submitDecision = (decision) => sendMessage('submit_decision', { decision });
  const listRooms = () => sendMessage('list_rooms');
  const getRoomInfo = (roomId) => sendMessage('room_info', { roomId });
  const clearMessages = () => setMessages([]);

  const value = {
    isConnected,
    userId,
    username,
    currentRoom,
    availableRooms,
    roomInfo,
    isAdmin,
    messages,
    registerUser,
    createRoom,
    joinRoom,
    leaveRoom,
    submitDecision,
    listRooms,
    getRoomInfo,
    clearMessages
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
