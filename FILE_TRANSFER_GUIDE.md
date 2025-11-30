# File Transfer Implementation Guide

## Overview
This document explains the file transfer functionality added to the socket.io implementation for human-to-human document sharing.

## Architecture

### Sender Side
When sending a file, the data is packaged according to this format:
```javascript
{
  recipient_id: "user_id_here",
  file_packet: [
    filename,      // String: "document.pdf"
    raw_file,      // Array: Binary data as array of bytes
    filetype,      // String: "documents" (images coming later)
    ext,           // String: ".pdf", ".docx", etc. (includes the period)
    size_bytes,    // Number: File size in bytes
    tags           // Array: Metadata tags for filtering (can be empty [])
  ]
}
```

### Receiver Side
When receiving a file notification, the data includes:
```javascript
{
  file_url: "https://...",  // URL to download the file
  sender_id: "user_id",
  filename: "document.pdf",
  filetype: "documents",
  ext: ".pdf",
  size_bytes: 12345,
  tags: ["invoice", "important"],
  timestamp: "2025-11-26T..."
}
```

## API Reference

### Core Functions

#### `extractFileMetadata(file, tags = [])`
Extracts metadata from a File object and converts it to the required format.

**Parameters:**
- `file` (File): The file object from an input element
- `tags` (Array<string>): Optional metadata tags

**Returns:** Promise<Object> containing:
- `filename`: Original filename
- `raw_file`: Array of bytes (converted from Uint8Array)
- `filetype`: Currently always "documents"
- `ext`: File extension including the period (e.g., ".pdf")
- `size_bytes`: File size in bytes
- `tags`: Array of metadata tags

**Example:**
```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const metadata = await extractFileMetadata(file, ['invoice', 'important']);
```

---

#### `sendFileToUser(recipientUserId, file, tags = [], additionalData = {})`
Sends a file to another user via socket.io.

**Parameters:**
- `recipientUserId` (string): The user ID of the recipient
- `file` (File): The file object to send
- `tags` (Array<string>): Optional metadata tags
- `additionalData` (Object): Any additional data to include in the packet

**Returns:** Promise<Object> - The complete message packet sent

**Throws:** Error if socket is not connected or no file provided

**Example:**
```javascript
try {
  const file = document.querySelector('input[type="file"]').files[0];
  await sendFileToUser('12345', file, ['contract', 'urgent'], {
    message: 'Here is the contract'
  });
  console.log('File sent successfully!');
} catch (error) {
  console.error('Failed to send file:', error);
}
```

---

#### `setupFileTransferHandlers(onFileReceived)`
Sets up socket event listeners for receiving files.

**Parameters:**
- `onFileReceived` (Function): Callback function called when a file is received

**Callback receives:**
```javascript
{
  file_url: string,
  sender_id: string,
  filename: string,
  filetype: string,
  ext: string,
  size_bytes: number,
  tags: Array<string>,
  timestamp: string
}
```

**Example:**
```javascript
setupFileTransferHandlers((fileData) => {
  console.log('Received file:', fileData.filename);
  console.log('Download URL:', fileData.file_url);
  console.log('From user:', fileData.sender_id);
  
  // Update UI, show notification, etc.
  showNotification(`New file: ${fileData.filename}`);
});
```

---

#### `removeFileTransferHandlers()`
Removes all file transfer event listeners. Call this on component unmount.

**Example:**
```javascript
useEffect(() => {
  setupFileTransferHandlers(handleFileReceived);
  
  return () => {
    removeFileTransferHandlers();
  };
}, []);
```

---

#### `downloadFileFromUrl(fileUrl, filename)`
Helper function to trigger a file download from a URL.

**Parameters:**
- `fileUrl` (string): The URL to download from
- `filename` (string): The filename to save as

**Example:**
```javascript
downloadFileFromUrl(
  'https://example.com/files/document.pdf',
  'my-document.pdf'
);
```

---

## Socket Events

### Emitted Events (Client → Server)

#### `send_file`
Emitted when sending a file to another user.

**Payload:**
```javascript
{
  recipient_id: string,
  file_packet: [filename, raw_file, filetype, ext, size_bytes, tags],
  ...additionalData
}
```

**Acknowledgment callback:**
```javascript
(response) => {
  if (response?.success) {
    console.log('File sent successfully');
  } else {
    console.error('File send failed');
  }
}
```

---

### Received Events (Server → Client)

#### `file_received`
Received when another user sends you a file.

**Payload:**
```javascript
{
  file_url: string,
  sender_id: string,
  filename: string,
  filetype: string,
  ext: string,
  size_bytes: number,
  tags: Array<string>,
  timestamp: string
}
```

#### `file_upload_progress` (Optional)
Progress updates during file upload (if server supports it).

#### `file_upload_complete` (Optional)
Notification when file upload is complete (if server supports it).

---

## Usage Examples

### React Component Example

```javascript
import React, { useEffect, useState } from 'react';
import { 
  sendFileToUser, 
  setupFileTransferHandlers, 
  removeFileTransferHandlers,
  downloadFileFromUrl,
  initializeSocket 
} from './Components/socket';

function FileSharing() {
  const [receivedFiles, setReceivedFiles] = useState([]);

  useEffect(() => {
    // Initialize socket
    initializeSocket().then(() => {
      // Setup file handlers
      setupFileTransferHandlers((fileData) => {
        setReceivedFiles(prev => [fileData, ...prev]);
        alert(`New file: ${fileData.filename}`);
      });
    });

    return () => removeFileTransferHandlers();
  }, []);

  const handleSendFile = async (event) => {
    const file = event.target.files[0];
    const recipientId = prompt('Enter recipient user ID:');
    
    try {
      await sendFileToUser(recipientId, file, ['shared']);
      alert('File sent!');
    } catch (error) {
      alert('Failed to send file: ' + error.message);
    }
  };

  return (
    <div>
      <h2>File Sharing</h2>
      
      {/* Send File */}
      <input type="file" onChange={handleSendFile} />
      
      {/* Received Files */}
      <h3>Received Files</h3>
      {receivedFiles.map((file, i) => (
        <div key={i}>
          <p>{file.filename} ({file.size_bytes} bytes)</p>
          <button onClick={() => downloadFileFromUrl(file.file_url, file.filename)}>
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
import { 
  initializeSocket,
  sendFileToUser, 
  setupFileTransferHandlers,
  downloadFileFromUrl 
} from './Components/socket';

// Initialize
initializeSocket().then(() => {
  console.log('Socket ready for file transfer');
  
  // Setup receiver
  setupFileTransferHandlers((fileData) => {
    console.log('File received:', fileData);
    // Add to UI, show notification, etc.
  });
});

// Send file
document.querySelector('#fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const recipientId = document.querySelector('#recipientId').value;
  const tags = ['document', 'important'];
  
  try {
    await sendFileToUser(recipientId, file, tags);
    alert('File sent successfully!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

---

## File Type Support

### Currently Supported
- **Documents**: PDF, DOCX, TXT, etc.
- File type is set to `"documents"` for all files

### Coming Soon
- **Images**: JPG, PNG, GIF, etc.
- File type will be `"images"` for image files

---

## Best Practices

### 1. File Size Considerations
```javascript
// Check file size before sending
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large. Maximum size is 10MB');
  return;
}

await sendFileToUser(recipientId, file, tags);
```

### 2. Error Handling
```javascript
try {
  await sendFileToUser(recipientId, file, tags);
} catch (error) {
  if (error.message.includes('not connected')) {
    // Socket connection issue
    alert('Please wait for connection to establish');
  } else {
    // Other error
    console.error('File send error:', error);
  }
}
```

### 3. Progress Feedback
```javascript
// Show loading state while sending
setSending(true);
try {
  await sendFileToUser(recipientId, file, tags);
  showSuccessMessage('File sent!');
} finally {
  setSending(false);
}
```

### 4. Cleanup in React
```javascript
useEffect(() => {
  setupFileTransferHandlers(handleFileReceived);
  
  // IMPORTANT: Cleanup on unmount
  return () => {
    removeFileTransferHandlers();
  };
}, []);
```

---

## Troubleshooting

### File not sending
1. Check socket connection: `isSocketConnected()`
2. Verify recipient ID is correct
3. Check file size (may have server limits)
4. Check browser console for errors

### File not receiving
1. Verify `setupFileTransferHandlers()` was called
2. Check that callback function is defined
3. Verify socket is connected and room is joined
4. Check server logs for delivery issues

### Download not working
1. Verify `file_url` is present in received data
2. Check CORS settings if downloading from different domain
3. Verify URL is accessible

---

## Security Considerations

1. **File Validation**: Always validate file types and sizes on both client and server
2. **Virus Scanning**: Server should scan uploaded files for malware
3. **Access Control**: Verify sender/receiver permissions on server
4. **URL Expiration**: File URLs should expire after a reasonable time
5. **Encryption**: Files should be transmitted over secure connections (WSS/HTTPS)

---

## Server-Side Requirements

The server must implement:

1. **`send_file` event handler**
   - Receive file_packet from sender
   - Store file securely
   - Generate file_url
   - Emit `file_received` to recipient

2. **File storage**
   - Store raw_file binary data
   - Associate with metadata (filename, ext, tags, etc.)
   - Generate secure, temporary download URLs

3. **File delivery**
   - Emit `file_received` event to recipient's room
   - Include file_url and all metadata

---

## Migration Notes

If you have existing socket code, the file transfer functionality is **additive** and won't break existing features. Simply import and use the new functions as needed.

```javascript
// Existing socket usage still works
import { getSocket, initializeSocket } from './Components/socket';

// New file transfer functions
import { sendFileToUser, setupFileTransferHandlers } from './Components/socket';
```

---

## Testing

### Manual Testing Checklist
- [ ] Send a small file (< 1MB)
- [ ] Send a large file (> 5MB)
- [ ] Send file with tags
- [ ] Receive file notification
- [ ] Download received file
- [ ] Test with different file types (.pdf, .docx, .txt)
- [ ] Test error handling (no file, no recipient)
- [ ] Test socket reconnection during transfer

### Example Test Code
```javascript
// Test file send
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
await sendFileToUser('test_user_123', testFile, ['test']);

// Test file receive
setupFileTransferHandlers((fileData) => {
  console.log('Test file received:', fileData);
  assert(fileData.file_url, 'file_url should be present');
  assert(fileData.filename === 'test.txt', 'filename should match');
});
```

---

## Future Enhancements

1. **Image Support**: Add image file type detection and handling
2. **Progress Tracking**: Real-time upload/download progress bars
3. **File Chunking**: Support for very large files (> 100MB)
4. **Multiple Files**: Send multiple files at once
5. **File Preview**: Generate thumbnails for images/PDFs
6. **Drag & Drop**: Drag and drop file upload interface
7. **File History**: Persistent storage of sent/received files
8. **Search & Filter**: Search files by tags, filename, sender, etc.
