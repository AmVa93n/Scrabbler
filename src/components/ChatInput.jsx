import { useState, useContext } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { useSocket } from '../context/socket.context';
import { RoomContext } from '../context/room.context';
import { AuthContext } from "../context/auth.context";

function ChatInput() {
    const [message, setMessage] = useState('');
    const socket = useSocket();
    const { roomId } = useContext(RoomContext)
    const User = useContext(AuthContext).user;

    const handleSend = () => {
        if (message.trim()) {
            const messageData = {
                sender: User._id,
                text: message,
            }
            socket.emit('message', roomId, messageData)
            setMessage(''); // Clear the input field after sending
        }
    };

    return (
        <Box sx={{ padding: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send message on pressing Enter
                sx={{ marginRight: 2 }}
            />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSend}
                disabled={!message.trim()}
            >
                Send
            </Button>
        </Box>
    );
}

export default ChatInput;
