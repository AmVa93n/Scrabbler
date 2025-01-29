import { useState } from 'react';
import { TextField, Button, Box, IconButton, InputAdornment } from '@mui/material';
import useSocket from '../../hooks/useSocket';
import Picker from '@emoji-mart/react';
import data, { Skin } from '@emoji-mart/data';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import useAuth from '../../hooks/useAuth';
import { useParams } from 'react-router-dom';

function ChatInput() {
    const [message, setMessage] = useState('');
    const { socket } = useSocket();
    const { roomId } = useParams();
    const { user: User } = useAuth();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    function handleSend() {
        if (message.trim()) {
            const messageData = {
                sender: User?._id,
                text: message,
            }
            socket?.emit('message', roomId, messageData)
            setMessage(''); // Clear the input field after sending
        }
    };

    function handleEmojiClick(emoji: Skin) {
        setMessage((prevMessage) => prevMessage + emoji.native); // Add emoji to message
        setIsPickerOpen(false);
    };

    return (
        <Box sx={{ padding: 1, display: 'flex', alignItems: 'center' }}>
            <TextField
                size='small'
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send message on pressing Enter
                sx={{ marginRight: 1 }}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                                    sx={{ px: 0 }}
                                >
                                    <EmojiEmotionsIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                }}}
            />

            <Button 
                variant="contained" 
                color="primary" 
                sx={{textTransform: 'none'}}
                onClick={handleSend}
                disabled={!message.trim()}
            >
                Send
            </Button>

            {isPickerOpen && 
                <div style={{ position: 'absolute', bottom: 80, right: 20 }}>
                    <Picker data={data} onEmojiSelect={handleEmojiClick} />
                </div>
            }
        </Box>
    );
}

export default ChatInput;
