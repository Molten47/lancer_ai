// File Transfer Integration for SideAsssistant.jsx
// Add this code to your SideAsssistant.jsx component

// ============================================================================
// 1. UPDATE IMPORTS (at the top of the file)
// ============================================================================
// Change this line:
// import { Send, Paperclip, Loader2, CheckCircle, Bot, X } from 'lucide-react';
// To:
import { Send, Paperclip, Loader2, CheckCircle, Bot, X, FileText } from 'lucide-react';

// Change this line:
// import socket from '../../../Components/socket';
// To:
import socket, { sendFileToUser, setupFileTransferHandlers, removeFileTransferHandlers } from '../../../Components/socket';


// ============================================================================
// 2. ADD NEW STATE (add this with the other useState declarations)
// ============================================================================
const [isSendingFile, setIsSendingFile] = useState(false);


// ============================================================================
// 3. ADD FILE TRANSFER HANDLERS (add this useEffect after the socket listeners useEffect)
// ============================================================================
// Setup file transfer handlers
useEffect(() => {
  const handleFileReceived = (fileData) => {
    console.log('📥 File received from agent:', fileData);
    
    // Add file notification as a message
    const fileMessage = {
      id: `file-${Date.now()}`,
      type: 'ai',
      content: `📎 File received: ${fileData.filename}\nSize: ${(fileData.size_bytes / 1024).toFixed(2)} KB\n\nClick to download: ${fileData.file_url}`,
      timestamp: new Date(),
      sender: assistantName,
      isStatus: false,
      isFile: true,
      fileData: fileData
    };
    
    setMessages(prev => [...prev, fileMessage]);
  };
  
  setupFileTransferHandlers(handleFileReceived);
  
  return () => {
    removeFileTransferHandlers();
  };
}, [assistantName]);


// ============================================================================
// 4. REPLACE handleFileSelect FUNCTION
// ============================================================================
// Replace the existing handleFileSelect function with this:
const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  // Add files to attachments for display
  setAttachments(prev => [...prev, ...files]);
  
  // Send each file immediately to the AI agent
  for (const file of files) {
    try {
      setIsSendingFile(true);
      
      // Show file upload status
      const uploadMessage = {
        id: `upload-${Date.now()}-${Math.random()}`,
        type: 'user',
        content: `📎 Sending file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        timestamp: new Date(),
        sender: userName,
        isStatus: false,
        isFile: true
      };
      
      setMessages(prev => [...prev, uploadMessage]);
      
      // Send file to AI agent
      await sendFileToUser(
        ASSISTANT_ID,
        file,
        ['user-upload', 'assistant-chat'],
        {
          message_content: `File uploaded: ${file.name}`,
          own_id: parseInt(own_id.current),
          sender_tag: 'user'
        }
      );
      
      console.log('✅ File sent to agent:', file.name);
      
    } catch (error) {
      console.error('❌ Error sending file:', error);
      
      // Show error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: `Failed to send file "${file.name}": ${error.message}`,
        timestamp: new Date(),
        sender: 'System',
        isStatus: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingFile(false);
    }
  }
  
  // Clear file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};


// ============================================================================
// 5. UPDATE THE PAPERCLIP BUTTON (in the JSX)
// ============================================================================
// Replace the paperclip button with this:
<button 
  onClick={() => fileInputRef.current?.click()}
  disabled={!isConnected || isSendingFile}
  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 relative"
  title="Attach file to send to AI agent"
>
  {isSendingFile ? (
    <Loader2 size={20} className="animate-spin text-blue-600" />
  ) : (
    <Paperclip size={20} />
  )}
</button>
