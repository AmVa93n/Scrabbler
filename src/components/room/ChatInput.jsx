import { useState, useContext } from 'react';
import { TextField, Button, Box, IconButton, Popover, InputAdornment } from '@mui/material';
import { useSocket } from '../../context/socket.context';
import { RoomContext } from '../../context/room.context';
import { AuthContext } from "../../context/auth.context";
import Picker from '@emoji-mart/react';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

function ChatInput() {
    const [message, setMessage] = useState('');
    const socket = useSocket();
    const { roomId } = useContext(RoomContext)
    const User = useContext(AuthContext).user;
    const [anchorEl, setAnchorEl] = useState(null); // For emoji picker popover
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    function handleSend() {
        if (message.trim()) {
            const messageData = {
                sender: User._id,
                text: message,
            }
            socket.emit('message', roomId, messageData)
            setMessage(''); // Clear the input field after sending
        }
    };

    function handleEmojiClick(emoji) {
        setMessage((prevMessage) => prevMessage + emoji.native); // Add emoji to message
        closeEmojiPicker()
    };

    function openEmojiPicker(event) {
        setAnchorEl(event.currentTarget);
        setIsPickerOpen(true)
    };

    function closeEmojiPicker() {
        setAnchorEl(null);
        setIsPickerOpen(false)
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
                                    onClick={openEmojiPicker}
                                    sx={{ px: 0 }}
                                >
                                    <EmojiEmotionsIcon />
                                </IconButton>
                                <Popover
                                    open={isPickerOpen}
                                    anchorEl={anchorEl}
                                    onClose={closeEmojiPicker}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    disablePortal={true}
                                >
                                    <Box sx={{mr: 30}}>
                                        <Picker onEmojiSelect={handleEmojiClick} />
                                    </Box>
                                </Popover>
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
        </Box>
    );
}

export default ChatInput;
