import React, { useContext, useRef, useEffect, Fragment } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { RoomContext } from '../../context/room.context';
import { Box } from '@mui/material';
import Reactions from './Reactions';

export default function RoomChat() {
    const { messages } = useContext(RoomContext)
    const chatContainerRef = useRef(null);

  // Scroll chat to the bottom whenever messages array changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function renderDivider(message, index) {
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
                                <>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: 'text.primary', display: 'inline' }}
                                >
                                    {''}
                                </Typography>
                                {message.text}
                                </>
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
