import React, { useEffect, useState, useRef } from 'react';
import {
    sendFileToUser,
    setupFileTransferHandlers,
    removeFileTransferHandlers,
    downloadFileFromUrl,
    initializeSocket
} from './socket';

/**
 * Example component demonstrating file transfer functionality
 * This shows how to send and receive files via socket.io
 */
const FileTransferExample = () => {
    const [recipientId, setRecipientId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [tags, setTags] = useState('');
    const [receivedFiles, setReceivedFiles] = useState([]);
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        initializeSocket().then(() => {
            console.log('Socket initialized for file transfer');

            // Setup file transfer handlers
            setupFileTransferHandlers(handleFileReceived);
        }).catch(error => {
            console.error('Failed to initialize socket:', error);
        });

        // Cleanup on unmount
        return () => {
            removeFileTransferHandlers();
        };
    }, []);

    /**
     * Callback when a file is received from another user
     */
    const handleFileReceived = (fileData) => {
        console.log('File received in component:', fileData);

        // Add to received files list
        setReceivedFiles(prev => [fileData, ...prev]);

        // Optional: Show notification
        alert(`New file received: ${fileData.filename}`);
    };

    /**
     * Handle file selection from input
     */
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            console.log('File selected:', file.name, file.size, 'bytes');
        }
    };

    /**
     * Send the selected file to the recipient
     */
    const handleSendFile = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        if (!recipientId) {
            alert('Please enter a recipient user ID');
            return;
        }

        try {
            setSending(true);

            // Parse tags (comma-separated)
            const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

            // Send the file
            await sendFileToUser(recipientId, selectedFile, tagArray);

            alert(`File "${selectedFile.name}" sent successfully!`);

            // Reset form
            setSelectedFile(null);
            setTags('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending file:', error);
            alert(`Failed to send file: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    /**
     * Download a received file
     */
    const handleDownload = (fileData) => {
        downloadFileFromUrl(fileData.file_url, fileData.filename);
    };

    /**
     * Format file size for display
     */
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>File Transfer Demo</h2>

            {/* Send File Section */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h3>Send File</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Recipient User ID:
                    </label>
                    <input
                        type="text"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Enter user ID"
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Select File:
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        style={{
                            width: '100%',
                            padding: '8px'
                        }}
                    />
                    {selectedFile && (
                        <p style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Tags (comma-separated, optional):
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g., invoice, contract, important"
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <button
                    onClick={handleSendFile}
                    disabled={sending || !selectedFile || !recipientId}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: sending ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {sending ? 'Sending...' : 'Send File'}
                </button>
            </div>

            {/* Received Files Section */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h3>Received Files ({receivedFiles.length})</h3>

                {receivedFiles.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No files received yet</p>
                ) : (
                    <div>
                        {receivedFiles.map((fileData, index) => (
                            <div
                                key={index}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>
                                            📄 {fileData.filename}
                                        </h4>
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                            <strong>From:</strong> User {fileData.sender_id}
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                            <strong>Size:</strong> {formatFileSize(fileData.size_bytes)}
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                            <strong>Type:</strong> {fileData.filetype} ({fileData.ext})
                                        </p>
                                        {fileData.tags && fileData.tags.length > 0 && (
                                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                                <strong>Tags:</strong> {fileData.tags.join(', ')}
                                            </p>
                                        )}
                                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                                            {new Date(fileData.timestamp).toLocaleString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(fileData)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginLeft: '15px'
                                        }}
                                    >
                                        ⬇️ Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileTransferExample;
