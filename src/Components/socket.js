// socket.js - Enhanced Socket.io setup with manual connection control
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// Track connection state
let isConnected = false;
let userJoined = false;
let connectionPromise = null; // Track connection attempts
let isConnecting = false; // NEW: Track if currently connecting

// Create socket with proper configuration
const socket = io(API_URL, {
  // Manual connection control
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
    const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
    cb({
      token: token
    });
  }
});

// Function to get user ID
const getUserData = () => {
  try {
    const userId = localStorage.getItem('user_id');
    return userId;
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
      room_name: String(userId),
      user: parseInt(userId)
    };
    
    console.log('Joining room with data:', roomData);
    socket.emit('join', roomData);
    userJoined = true;
  }
};

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
  isConnected = true;
  isConnecting = false; // FIXED: Reset connecting state
  
  // Automatically join user's room upon connection
  joinUserRoom();
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  isConnected = false;
  userJoined = false;
  isConnecting = false; // FIXED: Reset connecting state
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  isConnected = false;
  isConnecting = false; // FIXED: Reset connecting state
  connectionPromise = null; // FIXED: Reset promise on error
});

socket.on('reconnect', () => {
  console.log('Reconnected to server');
  isConnected = true;
  userJoined = false;
  isConnecting = false; // FIXED: Reset connecting state
  joinUserRoom();
});

socket.on('joined', (data) => {
  console.log('Successfully joined room:', data);
});

socket.on('join_error', (error) => {
  console.error('Error joining room:', error);
  userJoined = false;
});

// FIXED: Initialize socket connection when user is authenticated
export const initializeSocket = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 InitializeSocket called - Current states:', {
      socketConnected: socket.connected,
      isConnected,
      isConnecting,
      connectionPromise: !!connectionPromise
    });

    // If already connected, resolve immediately
    if (socket.connected && isConnected) {
      console.log('✅ Socket already connected');
      resolve();
      return;
    }
    
    // If already connecting, return the existing promise
    if (isConnecting && connectionPromise) {
      console.log('⏳ Already connecting, returning existing promise');
      return connectionPromise;
    }
    
    console.log('🚀 Initializing socket connection...');
    isConnecting = true; // FIXED: Set connecting state
    
    connectionPromise = new Promise((promiseResolve, promiseReject) => {
      const connectTimeout = setTimeout(() => {
        console.error('❌ Socket connection timeout');
        isConnecting = false;
        connectionPromise = null;
        promiseReject(new Error('Socket connection timeout'));
      }, 10000);
      
      const onConnect = () => {
        console.log('✅ Socket connect event fired');
        clearTimeout(connectTimeout);
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        isConnecting = false;
        connectionPromise = null;
        console.log('Socket initialized successfully');
        promiseResolve();
      };
      
      const onConnectError = (error) => {
        console.error('❌ Socket connect_error event fired:', error);
        clearTimeout(connectTimeout);
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        isConnecting = false;
        connectionPromise = null;
        console.error('Socket initialization failed:', error);
        promiseReject(error);
      };
      
      socket.on('connect', onConnect);
      socket.on('connect_error', onConnectError);
      
      // FIXED: Only connect if not already connected
      if (!socket.connected) {
        console.log('🔌 Calling socket.connect()');
        socket.connect();
      } else {
        // If somehow already connected but we missed it
        console.log('🔄 Socket already connected, triggering connect handler');
        onConnect();
      }
    });
    
    connectionPromise.then(resolve).catch(reject);
  });
};

// Function to manually trigger room joining
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

// FIXED: Connection status with connecting state
export const getConnectionStatus = () => ({
  isConnected,
  userJoined,
  isConnecting, // NEW: Include connecting state
  socketId: socket.id
});

// FIXED: Cleanup with proper state reset
export const cleanup = () => {
  console.log('🧹 Cleaning up socket connection');
  if (socket.connected) {
    socket.disconnect();
  }
  isConnected = false;
  userJoined = false;
  isConnecting = false;
  connectionPromise = null;
};

// Manual socket connection controls
export const connectSocket = () => {
  if (!socket.connected && !isConnecting) {
    console.log('🔌 Manually connecting socket...');
    isConnecting = true;
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 Manually disconnecting socket...');
    socket.disconnect();
  }
  isConnected = false;
  userJoined = false;
  isConnecting = false;
  connectionPromise = null;
};

// Enhanced connection status check
export const isSocketConnected = () => socket.connected && isConnected;

// FIXED: New function to check if currently connecting
export const isSocketConnecting = () => isConnecting;

// Export API_URL for use in components
export const getAPIUrl = () => API_URL;

export default socket;