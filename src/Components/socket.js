// socket.js - Socket.io setup according to documentation
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ;

// Create socket with proper configuration per documentation
const socket = io(API_URL, {
  // Only connect when needed
  autoConnect: false,
  
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

// Export API_URL for use in components
export const getAPIUrl = () => API_URL;

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

export default socket;