import { useContext } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { RoomContext } from '../context/room.context';
import { AuthContext } from "../context/auth.context";
import BlockIcon from '@mui/icons-material/Block';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TimerIcon from '@mui/icons-material/Timer';
import Timer from '../components/Timer';
import '@fontsource/roboto/700.css';

export default function UserList() {
    const User = useContext(AuthContext).user;
    const { roomId, room, setRoom, usersWaiting, turnPlayer, turnEndTime, turnNumber, 
        isModalOpen, setIsModalOpen, modalMessage, inactivePlayerIds } = useContext(RoomContext)
    const list = room.gameSession ? room.gameSession.players : usersWaiting

  return (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {list.map((user) => {
        const labelId = `checkbox-list-secondary-label-${user}`;
        return (
          <ListItem
            key={user._id}
            secondaryAction={
                (User._id === room.creator && User._id !== user._id) && 
                <IconButton edge="end" aria-label="skip" disabled={!inactivePlayerIds.includes(user._id)}>
                    <Tooltip title="Skip turns">
                        <BlockIcon />
                    </Tooltip>
                </IconButton>
            }
          >
            <ListItemAvatar>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={'👑'}
                    invisible={user._id !== room.creator}
                >
                    <Avatar
                        alt={`Avatar n°${user + 1}`}
                        src={user.profilePic}
                    />
                </Badge>
            </ListItemAvatar>
            <ListItemText id={labelId} primary={user.name} sx={{
                fontWeight: room.gameSession && turnPlayer && user._id === turnPlayer._id ? 'bold' : 'normal'
            }} />
            {(room.gameSession && turnPlayer && user._id === turnPlayer._id) &&
                <Chip icon={<TimerIcon />} label={
                    <Timer 
                        duration={(turnEndTime - Date.now()) / 1000} // Convert to seconds
                        onTimeout={() => {}} // The server will handle the timeout
                    />
                } 
                />
            }
          </ListItem>
        );
      })}
    </List>
  );
}