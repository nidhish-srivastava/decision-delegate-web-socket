import { WebSocketServer ,WebSocket} from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server for Decision Delegation Platform');
});

// Create WebSocket server - note it's WebSocketServer, not WebSocket.Server
const wss = new WebSocketServer({ server });

// Data structures

const rooms = new Map()
const users = new Map()

wss.on('connection',(ws,req)=>{
    const userId = uuidv4()
    console.log(`New connection : ${userId}`);

    // Handle messages
    ws.on('message',(message)=>{
        console.log('New WebSocket connection established');
        try {
            const data = JSON.parse(message)
            handleMessage(ws,userId,data)
        } catch (error) {
            console.error('Error parsing message:', error);
            sendToClient(ws,{type : 'error',message : "Invalid message format"})
        }
    })

    // Handle disconnection
    ws.on('close',()=>{
        handleDisconnection(userId)
    })

    // Initial connection response
    sendToClient(ws,{
        type : 'connected',
        userId,
        message : "Connected to Decision Delegate platform"
    })
})


// Message handler
function handleMessage(ws,userId,data){
    switch(data.type){
        case 'register':
            registerUser(ws,userId,data)
            break
        case 'create_room':
            createRoom(ws,userId,data)    
            break
        case 'join_room':
            joinRoom(ws,userId,data)    
            break
        case 'leave_room':
            leaveRoom(ws,userId,data)    
            break
        case 'submit_decision':
            submitDecision(ws,userId,data)    
            break
        case 'list_rooms':
            listRooms(ws)    
            break
        case 'room_info':
            getRoomInfo(ws,userId,data)    
            break
        default:
            sendToClient(ws,{type : "error",message : "Unknown message type"})    
    }
}

// Register user
function  registerUser(ws,userId,data){
    if(!data.username){
        sendToClient(ws,{type : "error",message:"Username is required"})
        return
    }

    users.set(userId,{
        username : data.username,
        currentRoom : null
    })

    sendToClient(ws,{
        type : "registered",
        userId,
        username : data.username
    })
}

// Create a new room 
function createRoom(ws,userId,data){
    const user = users.get(userId)
    if(!user){
        sendToClient(ws,{type : 'error',message : "User not registered"})
        return
    }
    if(!data.title || !data.problem){
        sendToClient(ws,{type : 'error',message : 'Room title and problem are required'})
        return
    }

    const roomId = uuidv4()

    rooms.set(roomId,{
        id : roomId,
        title : data.title,
        problem : data.problem,
        admin : userId,
        participants : new Map([[userId,ws]]),
        decisions : new Map(),
        createdAt : Date.now()
    })

    user.currentRoom =  roomId
    
    sendToClient(ws,{
        type : "room_created",
        roomId,
        title :  data.title,
        problem : data.problem
    })

    // BroadCast updated room list to all connected clients
    broadcastRoomList()
}

// Join a room 
function joinRoom(ws,userId,data){
    const user = users.get(userId)
    const room = rooms.get(data.roomId)

    if(!user){
        sendToClient(ws,{type : 'error',message : "User not registered"})
        return
    }

    if(!room){
        sendToClient(ws,{type : "error",message : "Room not found"})
        return
    }

    // leave current room if in one
    if(user.currentRoom){
        leaveRoom(ws,userId)
    }

    // Add to new room 
    room.participants.set(userId,ws)
    user.currentRoom = data.roomId

    sendToClient(ws,{
        type : "room_joined",
        roomId : data.roomId,
        title : room.title,
        problem : room.problem,
        isAdmin : userId === room.admin
    })

    // Notify all participants in the room
    broadcastToRoom(room,{
        type : "participant_joined",
        userId,
        username : user.username,
        participantCount : room.participants.size
    })
}

// Leave a room
function leaveRoom(ws,userId){
    const user = users.get(userId)
    if(!user || !user.currentRoom) return

    const room = rooms.get(user.currentRoom)

    if(!room) return

    // remove from room
    room.participants.delete(userId)
    room.decisions.delete(userId)

    // clear user's current room
    user.currentRoom = null

    sendToClient(ws,{
        type : 'room_left'
    })

    // If room is empty and user was not admin,delete the room
    if(room.participants.size === 0 && userId!=room.admin){
        rooms.delete(room.id)
        broadcastRoomList()
    } else{
        // Notify remaining participants
        broadcastToRoom(room,{
            type : "participant_left",
            userId,
            username : user.username,
            participantCount : room.participants.size
        })

        // update room decisions
        broadcastRoomDecisions(room)
    }
}

function submitDecision(ws,userId,data){
    const user = users.get(userId)
    if(!user || !user.currentRoom){
        sendToClient(ws,{type : "error",message : "Not in room"})
        return
    }

    const room = rooms.get(user.currentRoom)
    if(!room){
        sendToClient(ws,{type : 'error',message : 'Room not found'})
        return
    }

    if(!data.decision || data.decision.trim() === ''){
        sendToClient(ws,{type : 'error',message : "Decision is required"})
        return
    }

    room.decisions.set(userId,{
        text : data.decision,
        timestamp : Date.now(),
        username : user.username
    })

    sendToClient(ws, { type: 'decision_submitted' });
  
  // Broadcast updated decisions to all room participants
    broadcastRoomDecisions(room);
}

// List all available rooms
function  listRooms(ws){
    const roomList = []

    rooms.forEach((room,roomId)=>{
        roomList.push({
            id : roomId,
            title : room.title,
            participantCount : room.participants.size,
            admin : users.get(room.admin)?.username || 'Unknown'
        })
    })

    sendToClient(ws, { 
        type: 'room_list', 
        rooms: roomList 
    });
}

// Get detailed information about a specific room
function getRoomInfo(ws, userId, data) {
    const room = rooms.get(data.roomId);
    
    if (!room) {
      sendToClient(ws, { type: 'error', message: 'Room not found' });
      return;
    }
    
    const participantsList = [];
    room.participants.forEach((_, participantId) => {
      const participant = users.get(participantId);
      if (participant) {
        participantsList.push({
          id: participantId,
          username: participant.username,
          isAdmin: participantId === room.admin
        });
      }
    });
    
    const decisionsList = [];
    room.decisions.forEach((decision, decisionUserId) => {
      decisionsList.push({
        userId: decisionUserId,
        username: users.get(decisionUserId)?.username || 'Unknown',
        text: decision.text,
        timestamp: decision.timestamp
      });
    });
    
    sendToClient(ws, {
      type: 'room_info',
      roomId: room.id,
      title: room.title,
      problem: room.problem,
      admin: users.get(room.admin)?.username || 'Unknown',
      participants: participantsList,
      decisions: decisionsList,
      isAdmin: userId === room.admin
    });
  }

// Handle user disconnection
function handleDisconnection(userId){
    const user = users.get(userId)

    console.log(`User disconnected : ${userId}`);

    if(user && user.currentRoom){
        const room = rooms.get(user.currentRoom)
        if(room){
            room.participants.delete(userId)

            // If admin left,close the room
            if(userId === room.admin){
                // Notify remaining participants that room is closing
                broadcastToRoom(room,{
                    type : 'room_closed',
                    message : 'Room admin has left,room is being closed'
                })

                // Move all participants out of the room
                room.participants.forEach((ws,participantId)=>{
                    const participant = users.get(participantId)
                    if(participant){
                        participant.currentRoom = null
                    }
                })

                // Delete the room
                rooms.delete(user.currentRoom)
                broadcastRoomList()
            } else{
                // Just a regular participant left
        broadcastToRoom(room, {
            type: 'participant_left',
            userId,
            username: user.username,
            participantCount: room.participants.size
          });
          
          // Update room decisions
          broadcastRoomDecisions(room);
            }
        }
    }

    // Remove user
  users.delete(userId);
    
}  


// Broadcast room decisions to all participants
function broadcastRoomDecisions(room) {
    const decisionsList = [];
    room.decisions.forEach((decision, userId) => {
      decisionsList.push({
        userId,
        username: users.get(userId)?.username || 'Unknown',
        text: decision.text,
        timestamp: decision.timestamp
      });
    });
    
    broadcastToRoom(room, {
      type: 'decisions_updated',
      decisions: decisionsList
    });
}


// Broadcast to all users in a room
function broadcastToRoom(room, message) {
    room.participants.forEach((ws) => {
      if (ws.readyState === WebSocketServer.OK) {
        sendToClient(ws, message);
      }
    });
}
  

// Broadcast room list to all connected users
function broadcastRoomList() {
    const roomList = [];
    
    rooms.forEach((room, roomId) => {
      roomList.push({
        id: roomId,
        title: room.title,
        participantCount: room.participants.size,
        admin: users.get(room.admin)?.username || 'Unknown'
      });
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        sendToClient(client, { 
          type: 'room_list_updated', 
          rooms: roomList 
        });
      }
    });
}



// Helper to send JSON data to client
function sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      console.log(data);
      ws.send(JSON.stringify(data));
    }
  }
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Decision Delegation Platform server running on port ${PORT}`);
  });