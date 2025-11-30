
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
  socket.removeAllListeners('reconnecting');

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

    socket.on('reconnecting', () => {
        console.log('🔌 Reconnection attempt started...');
        isConnecting = true; // Crucial: Set this flag
        isConnected = false;
        userJoined = false;
    });


socket.on('reconnect', () => {
    console.log('🔄 Reconnected to server');
    isConnected = true;
    isConnecting = false; // Connection is successful
    userJoined = false; // Must rejoin room
    
    // CRITICAL: Call the room join process immediately after reconnect
    setTimeout(() => {
        joinUserRoom(); // This MUST be the promise-based version
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

// ============================================================================
// FILE TRANSFER FUNCTIONALITY
// ============================================================================

// ============================================================================
// FILE TRANSFER FUNCTIONALITY - DIAGNOSTIC VERSION
// ============================================================================

/**
 * Extract file metadata and convert to binary format
 * @param {File} file - The file object from input
 * @param {Array<string>} tags - Optional metadata tags for filtering
 * @returns {Promise<Object>} - File packet data
 */
export const extractFileMetadata = async (file, tags = []) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const rawFile = new Uint8Array(arrayBuffer);
      
      // Extract file extension
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');
      const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
      
      // Determine file type
      const fileType = 'documents';
      
      const filePacket = {
        filename: fileName,
        raw_file: Array.from(rawFile), // Convert to array for JSON serialization
        filetype: fileType,
        ext: ext,
        size_bytes: file.size,
        tags: tags
      };
      
      console.log('📦 File packet created:', {
        filename: fileName,
        ext: ext,
        size_bytes: file.size,
        raw_file_length: filePacket.raw_file.length,
        first_bytes: filePacket.raw_file.slice(0, 10),
        tags: tags
      });
      
      resolve(filePacket);
    };
    
    reader.onerror = (error) => {
      console.error('❌ Error reading file:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Send a file to another user via socket - DIAGNOSTIC VERSION
 * @param {string} recipientUserId - The user ID of the recipient
 * @param {File} file - The file object to send
 * @param {Array<string>} tags - Optional metadata tags
 * @param {Object} additionalData - Any additional data to include in the message
 * @returns {Promise<Object>} - Server response
 */
export const sendFileToUser = async (recipientUserId, file, tags = [], additionalData = {}) => {
  return new Promise(async (resolve, reject) => {
    console.log('🔍 FILE TRANSFER DIAGNOSTIC START');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Step 1: Check socket connection
    console.log('Step 1: Checking socket connection...');
    if (!socket) {
      console.error('❌ Socket is null/undefined');
      reject(new Error('Socket not initialized'));
      return;
    }
    
    if (!socket.connected) {
      console.error('❌ Socket not connected');
      console.log('Socket state:', {
        connected: socket.connected,
        disconnected: socket.disconnected,
        id: socket.id
      });
      reject(new Error('Socket not connected'));
      return;
    }
    
    console.log('✅ Socket connected:', socket.id);
    
    // Step 2: Validate inputs
    console.log('\nStep 2: Validating inputs...');
    if (!file) {
      console.error('❌ No file provided');
      reject(new Error('No file provided'));
      return;
    }
    
    if (!recipientUserId) {
      console.error('❌ No recipient ID provided');
      reject(new Error('No recipient ID provided'));
      return;
    }
    
    console.log('✅ Inputs valid:', {
      recipientUserId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    try {
      // Step 3: Extract file metadata
      console.log('\nStep 3: Extracting file metadata...');
      const filePacket = await extractFileMetadata(file, tags);
      console.log('✅ File metadata extracted');
      
      // Step 4: Build message packet per documentation
      console.log('\nStep 4: Building message packet...');
      const messagePacket = {
        recipient_id: recipientUserId,
        file_packet: [
          filePacket.filename,    // 1. Filename
          filePacket.raw_file,    // 2. raw_file (byte/pure binary format)
          filePacket.filetype,    // 3. filetype
          filePacket.ext,         // 4. ext (with period)
          filePacket.size_bytes,  // 5. size_bytes
          filePacket.tags         // 6. tags (list, can be empty)
        ],
        ...additionalData
      };
      
      console.log('✅ Message packet built:', {
        recipient_id: messagePacket.recipient_id,
        file_packet_structure: [
          typeof messagePacket.file_packet[0], // filename
          `Array(${messagePacket.file_packet[1].length})`, // raw_file
          messagePacket.file_packet[2], // filetype
          messagePacket.file_packet[3], // ext
          messagePacket.file_packet[4], // size_bytes
          messagePacket.file_packet[5]  // tags
        ],
        additionalData: Object.keys(additionalData)
      });
      
      // Step 5: Check if socket has listeners for responses
      console.log('\nStep 5: Checking socket event listeners...');
      const listenerCount = socket.listeners('send_file').length;
      console.log('Socket "send_file" listeners:', listenerCount);
      
      // Step 6: Send file with timeout
      console.log('\nStep 6: Sending file to server...');
      console.log('Event name: "send_file"');
      console.log('Waiting for server acknowledgment...');
      
      let responseReceived = false;
      
      // Set a timeout
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          console.error('❌ TIMEOUT: No response from server after 30 seconds');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔍 DIAGNOSTIC SUMMARY:');
          console.log('- Socket connected: ✅');
          console.log('- File packet built: ✅');
          console.log('- Event emitted: ✅');
          console.log('- Server response: ❌ (TIMEOUT)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('\n💡 POSSIBLE ISSUES:');
          console.log('1. Server not listening for "send_file" event');
          console.log('2. Server processing file but not sending acknowledgment');
          console.log('3. Server encountered an error (check server logs)');
          console.log('4. Binary data too large for socket buffer');
          console.log('5. Server expecting different event name');
          reject(new Error('Server response timeout'));
        }
      }, 30000);
      
      // Emit with acknowledgment callback
      socket.emit('send_file', messagePacket, (response) => {
        responseReceived = true;
        clearTimeout(timeout);
        
        console.log('\n✅ Server response received!');
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (response?.success) {
          console.log('✅ FILE TRANSFER SUCCESS');
          console.log('File URL:', response.file_url);
          resolve({
            success: true,
            message_id: response.message_id,
            file_url: response.file_url,
            filename: response.filename,
            filetype: response.filetype,
            ext: response.ext,
            size_bytes: response.size_bytes,
            ...response
          });
        } else if (response?.error) {
          console.error('❌ FILE TRANSFER FAILED');
          console.error('Error:', response.error);
          reject(new Error(response.error));
        } else {
          console.warn('⚠️ Unexpected response format');
          // Assume success if we got a response
          resolve({
            success: true,
            ...response
          });
        }
      });
      
      console.log('📨 File packet emitted to server');
      console.log('⏳ Waiting for acknowledgment...');
      
    } catch (error) {
      console.error('❌ Error in file transfer process:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      reject(error);
    }
  });
};

/**
 * Setup file transfer event handlers with diagnostics
 * @param {Function} onFileReceived - Callback when file is received
 */
export const setupFileTransferHandlers = (onFileReceived) => {
  console.log('📥 Setting up file transfer handlers...');
  
  if (!socket) {
    console.warn('⚠️ Socket not initialized, creating socket first');
    createSocket();
  }
  
  // Remove existing listeners to prevent duplicates
  socket.removeAllListeners('file_received');
  socket.removeAllListeners('file_upload_progress');
  socket.removeAllListeners('file_upload_complete');
  socket.removeAllListeners('file_upload_error');
  
  // Handle incoming file notifications
  socket.on('file_received', (data) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 FILE RECEIVED EVENT TRIGGERED');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (data.file_url) {
      const fileData = {
        file_url: data.file_url,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        filename: data.filename,
        filetype: data.filetype,
        ext: data.ext,
        size_bytes: data.size_bytes,
        tags: data.tags || [],
        timestamp: data.timestamp || new Date().toISOString(),
        message_id: data.message_id
      };
      
      console.log('✅ File data processed:', {
        filename: fileData.filename,
        from: fileData.sender_id,
        file_url: fileData.file_url
      });
      
      if (onFileReceived && typeof onFileReceived === 'function') {
        onFileReceived(fileData);
      }
    } else {
      console.warn('⚠️ Received file notification without file_url');
      console.log('Data structure:', Object.keys(data));
    }
  });
  
  // Handle upload progress
  socket.on('file_upload_progress', (data) => {
    console.log('📊 File upload progress:', data.progress, '%');
  });
  
  // Handle upload completion
  socket.on('file_upload_complete', (data) => {
    console.log('✅ File upload complete:', data);
  });
  
  // Handle upload errors
  socket.on('file_upload_error', (data) => {
    console.error('❌ File upload error:', data.error);
  });
  
  console.log('✅ File transfer handlers setup complete');
  console.log('Listening for events:', [
    'file_received',
    'file_upload_progress', 
    'file_upload_complete',
    'file_upload_error'
  ]);
};

/**
 * Remove file transfer event handlers
 */
export const removeFileTransferHandlers = () => {
  if (socket) {
    socket.removeAllListeners('file_received');
    socket.removeAllListeners('file_upload_progress');
    socket.removeAllListeners('file_upload_complete');
    socket.removeAllListeners('file_upload_error');
    console.log('🧹 File transfer handlers removed');
  }
};

/**
 * Download file from URL (helper function)
 */
export const downloadFileFromUrl = async (fileUrl, filename) => {
  try {
    console.log('⬇️ Starting download:', filename);
    
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
    
    console.log('✅ Download completed:', filename);
  } catch (error) {
    console.error('❌ Download failed:', error);
    window.open(fileUrl, '_blank');
  }
};

export default getSocket();