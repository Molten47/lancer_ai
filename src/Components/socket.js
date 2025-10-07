// socket.js - Enhanced Socket.io setup with manual connection control
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// Track connection state
let isConnected = false;
let userJoined = false;
let connectionPromise = null;
let isConnecting = false;
let socket = null;

// FIXED: Function to create socket instance (called only once)
const createSocket = () => {
  if (socket) {
    console.log('⚠️ Socket already exists, reusing instance');
    return socket;
  }

  console.log('🏗️ Creating new socket instance');
  socket = io(API_URL, {
    autoConnect: false,
    path: "/socket.io/",
    transports: ['websocket', 'polling'],
    timeout: 30000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    
    auth: (cb) => {
      const token = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      console.log('🔐 Socket auth callback - Token:', token ? 'Present' : 'Missing', 'UserId:', userId);
      
      cb({
        token: token,
        user_id: userId
      });
    }
  });

  setupBaseHandlers();
  
  return socket;
};

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

// FIXED: Function to join user's room with proper error handling
const joinUserRoom = () => {
  const userId = getUserData();
  
  if (!userId) {
    console.warn('⚠️ Cannot join room: No user ID found');
    return false;
  }

  if (!isConnected || !socket?.connected) {
    console.warn('⚠️ Cannot join room: Socket not connected');
    return false;
  }

  if (userJoined) {
    console.log('ℹ️ User already joined room, skipping');
    return true;
  }
  
  const roomData = {
    room_name: String(userId),
    user: parseInt(userId)
  };
  
  console.log('🚪 Attempting to join room with data:', roomData);
  
  // CRITICAL: Emit with acknowledgment callback
  socket.emit('join', roomData, (response) => {
    if (response?.success) {
      console.log('✅ Join acknowledged by server:', response);
      userJoined = true;
    } else {
      console.error('❌ Join failed:', response);
    }
  });
  
  // Set a timeout to mark as joined even without server ack
  setTimeout(() => {
    if (!userJoined) {
      console.log('⏱️ Join timeout - marking as joined anyway');
      userJoined = true;
    }
  }, 2000);
  
  return true;
};

// FIXED: Setup base handlers with proper room joining
const setupBaseHandlers = () => {
  if (!socket) return;

  socket.removeAllListeners('connect');
  socket.removeAllListeners('disconnect');
  socket.removeAllListeners('connect_error');
  socket.removeAllListeners('reconnect');
  socket.removeAllListeners('joined');
  socket.removeAllListeners('join_error');

  socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
    isConnected = true;
    isConnecting = false;
    
    // FIXED: Use nextTick to ensure socket is fully ready
    setTimeout(() => {
      const joined = joinUserRoom();
      if (!joined) {
        console.error('❌ Failed to initiate room join');
      }
    }, 100);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
    isConnected = false;
    userJoined = false;
    isConnecting = false;
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error);
    isConnected = false;
    isConnecting = false;
    connectionPromise = null;
  });

  socket.on('reconnect', () => {
    console.log('🔄 Reconnected to server');
    isConnected = true;
    userJoined = false;
    isConnecting = false;
    
    setTimeout(() => {
      joinUserRoom();
    }, 100);
  });

  socket.on('joined', (data) => {
    console.log('✅ Successfully joined room (server confirmation):', data);
    userJoined = true;
  });

  socket.on('join_error', (error) => {
    console.error('❌ Error joining room:', error);
    userJoined = false;
    
    // Retry once after 1 second
    setTimeout(() => {
      console.log('🔄 Retrying room join...');
      joinUserRoom();
    }, 1000);
  });
};

// FIXED: Initialize socket connection with better promise handling
export const initializeSocket = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 InitializeSocket called - Current states:', {
      socketExists: !!socket,
      socketConnected: socket?.connected || false,
      isConnected,
      isConnecting,
      userJoined,
      connectionPromise: !!connectionPromise
    });

    if (!socket) {
      createSocket();
    }

    // FIXED: Check both socket.connected AND isConnected AND userJoined
    if (socket.connected && isConnected && userJoined) {
      console.log('✅ Socket already fully connected and room joined');
      resolve();
      return;
    }

    // If connected but not joined, try joining
    if (socket.connected && isConnected && !userJoined) {
      console.log('🔄 Socket connected but not joined, attempting join...');
      joinUserRoom();
      // Wait a bit for join to complete
      setTimeout(() => {
        resolve();
      }, 500);
      return;
    }
    
    if (isConnecting && connectionPromise) {
      console.log('⏳ Already connecting, returning existing promise');
      return connectionPromise;
    }
    
    console.log('🚀 Starting socket connection...');
    isConnecting = true;
    
    connectionPromise = new Promise((promiseResolve, promiseReject) => {
      const connectTimeout = setTimeout(() => {
        console.error('❌ Socket connection timeout after 15s');
        isConnecting = false;
        connectionPromise = null;
        promiseReject(new Error('Socket connection timeout'));
      }, 15000);
      
      const onConnect = () => {
        console.log('✅ Socket connect event fired in promise handler');
        
        // FIXED: Wait for room join before resolving
        const checkJoined = setInterval(() => {
          if (userJoined) {
            clearInterval(checkJoined);
            clearTimeout(connectTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            isConnecting = false;
            connectionPromise = null;
            console.log('✅ Socket initialized and room joined - ready for messages');
            promiseResolve();
          }
        }, 100);
        
        // Timeout for room join
        setTimeout(() => {
          clearInterval(checkJoined);
          if (!userJoined) {
            console.warn('⚠️ Room join taking too long, resolving anyway');
            clearTimeout(connectTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            isConnecting = false;
            connectionPromise = null;
            promiseResolve();
          }
        }, 3000);
      };
      
      const onConnectError = (error) => {
        console.error('❌ Socket connect_error in promise handler:', error);
        clearTimeout(connectTimeout);
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        isConnecting = false;
        connectionPromise = null;
        promiseReject(error);
      };
      
      socket.once('connect', onConnect);
      socket.once('connect_error', onConnectError);
      
      if (!socket.connected) {
        console.log('🔌 Calling socket.connect()');
        socket.connect();
      } else {
        console.log('🔄 Socket already connected, triggering handler');
        onConnect();
      }
    });
    
    connectionPromise.then(resolve).catch(reject);
  });
};

// Function to manually trigger room joining
export const rejoinRooms = () => {
  if (isConnected && socket) {
    userJoined = false;
    joinUserRoom();
  }
};

// Function to join additional rooms programmatically
export const joinRoom = (roomName, userId) => {
  if (isConnected && socket) {
    const roomData = {
      room_name: String(roomName),
      user: userId
    };
    console.log('🚪 Joining additional room:', roomData);
    socket.emit('join', roomData);
  }
};

// Connection status
export const getConnectionStatus = () => ({
  isConnected,
  userJoined,
  isConnecting,
  socketId: socket?.id || null
});

// Cleanup
export const cleanup = () => {
  console.log('🧹 Cleaning up socket connection');
  
  if (socket) {
    if (socket.connected) {
      socket.disconnect();
    }
  }
  
  isConnected = false;
  userJoined = false;
  isConnecting = false;
  connectionPromise = null;
};

// Manual socket connection controls
export const connectSocket = () => {
  if (!socket) {
    createSocket();
  }
  
  if (!socket.connected && !isConnecting) {
    console.log('🔌 Manually connecting socket...');
    isConnecting = true;
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    console.log('🔌 Manually disconnecting socket...');
    socket.disconnect();
  }
  isConnected = false;
  userJoined = false;
  isConnecting = false;
  connectionPromise = null;
};

// Connection status checks
export const isSocketConnected = () => socket?.connected && isConnected;
export const isSocketConnecting = () => isConnecting;
export const hasJoinedRoom = () => userJoined;

// Get socket instance (for event listeners in components)
export const getSocket = () => {
  if (!socket) {
    createSocket();
  }
  return socket;
};

export const getAPIUrl = () => API_URL;

export default getSocket();