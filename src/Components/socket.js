// socket.js - Enhanced Socket.io setup with auto room joining
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// Track connection state
let isConnected = false;
let userJoined = false;

// Create socket with proper configuration per documentation
const socket = io(API_URL, {
  // Connect immediately when app loads
  autoConnect: true,
  
  // Default namespace
  namespace: "/",
  
  // Transport options as specified
  transports: ['websocket', 'polling'],
  
  // Wait timeout as specified
  timeout: 30000,  // 30 seconds
  
  // Reconnection settings
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  
  // Add authentication if needed
  auth: (cb) => {
    const token = localStorage.getItem('access_jwt');
    cb({
      token: token
    });
  }
});

// Function to get user ID
const getUserData = () => {
  try {
    // Get user_id directly from localStorage (it's stored as a string)
    const userId = localStorage.getItem('user_id');
    return userId; // Returns the user ID as a string
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Function to join user's room automatically
const joinUserRoom = () => {
  const userId = getUserData();
  
  if (userId && isConnected && !userJoined) {
    const roomData = {
      room_name: String(userId), // Convert to string as required
      user: parseInt(userId)     // Keep as integer as required
    };
    
    console.log('Joining room with data:', roomData);
    socket.emit('join', roomData);
    userJoined = true;
    
    // Optional: Join additional rooms if needed
    // You can add logic here to join multiple rooms based on user's groups, conversations, etc.
  }
};

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
  isConnected = true;
  
  // Automatically join user's room upon connection
  joinUserRoom();
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  isConnected = false;
  userJoined = false; // Reset join status
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  isConnected = false;
});

// Handle reconnection - rejoin rooms
socket.on('reconnect', () => {
  console.log('Reconnected to server');
  isConnected = true;
  userJoined = false; // Reset to allow rejoining
  joinUserRoom();
});

// Optional: Listen for join confirmation from server
socket.on('joined', (data) => {
  console.log('Successfully joined room:', data);
});

// Optional: Handle join errors
socket.on('join_error', (error) => {
  console.error('Error joining room:', error);
  userJoined = false; // Allow retry
});

// Function to manually trigger room joining (useful if user data changes)
export const rejoinRooms = () => {
  if (isConnected) {
    userJoined = false;
    joinUserRoom();
  }
};

// Function to join additional rooms programmatically
export const joinRoom = (roomName, userId) => {
  if (isConnected) {
    const roomData = {
      room_name: String(roomName),
      user: userId
    };
    socket.emit('join', roomData);
  }
};

// Function to check connection status
export const isSocketConnected = () => isConnected;
// Add this to your socket.js exports
export const getConnectionStatus = () => ({
  isConnected,
  userJoined,
  socketId: socket.id
});
// Add this to your socket.js exports
export const cleanup = () => {
  if (socket.connected) {
    socket.disconnect();
  }
  isConnected = false;
  userJoined = false;
};

// Export API_URL for use in components
export const getAPIUrl = () => API_URL;

export default socket;