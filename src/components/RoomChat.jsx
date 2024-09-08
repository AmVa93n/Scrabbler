import { useContext, useRef, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { RoomContext } from '../context/room.context';

export default function RoomChat() {
    const { room } = useContext(RoomContext)
    const chatContainerRef = useRef(null);

  // Scroll chat to the bottom whenever messages array changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [room.messages]);

  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }} ref={chatContainerRef}>
        {room.messages.map(message =>
            <>
                <ListItem alignItems="flex-start" key={message._id}>
                    <ListItemAvatar>
                        <Avatar alt="Remy Sharp" src={message.sender.profilePic} />
                    </ListItemAvatar>
                <ListItemText
                    primary={message.sender.name}
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
                />
                </ListItem>

                <Divider variant="fullWidth" component="li" />
            </>
        )}
    </List>
  );
}
