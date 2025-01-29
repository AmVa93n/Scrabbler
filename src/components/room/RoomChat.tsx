import { useRef, useEffect, Fragment, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Reactions from './Reactions';
import { Message } from '../../types';
import useSocket from '../../hooks/useSocket';
import { useParams } from 'react-router-dom';
import accountService from '../../services/account.service';

export default function RoomChat() {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([] as Message[]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchMessages() {
            const { messages } = await accountService.getRoom(roomId || '');
            setMessages(messages);
        }
        fetchMessages();

        if (!socket) return;
        // Listen for new messages (public)
        socket.on('chatUpdated', (newMsg) => {
            setMessages(prevMessages => [...prevMessages, newMsg]);
        });

        // Listen for new reactions (public)
        socket.on('reactionsUpdated', (messageId, updatedReactions) => {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                  message._id === messageId ? {...message, reactions: updatedReactions} : message
                )
              );
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('chatUpdated');
            socket.off('reactionsUpdated');
        };
    }, [socket, roomId]);

  // Scroll chat to the bottom whenever messages array changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function renderDivider(message: Message, index: number) {
    if (index === messages.length - 1) return false
    if (message.minor) return false
    const nextMsg = messages[index+1]
    if (nextMsg?.minor) return false
    return true
  }

  return (
    <Box style={{ flex: 1, overflowY: 'auto' }} ref={chatContainerRef}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {messages.map((message, index) =>
                <Fragment key={message._id}>
                    <ListItem alignItems="flex-start">
                        {(message.sender || message.title) && 
                            <ListItemAvatar>
                                <Avatar src={message.title ? `/system.jpg` : message.sender ? message.sender.profilePic : ''} />
                            </ListItemAvatar>}
                        
                        <ListItemText
                            primary={message.sender ? message.sender.name : message.title}
                            secondary={
                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: 'grey', display: 'inline' }}
                                >
                                    {message.text}
                                </Typography>
                            }
                            sx={{whiteSpace: 'pre-line'}}
                        />
                    </ListItem>
                    {message.generated && <Reactions message={message} />}
                    {renderDivider(message, index) &&
                    <Divider variant="fullWidth" component="li" />}
                </Fragment>
            )}
        </List>
    </Box>
  );
}
