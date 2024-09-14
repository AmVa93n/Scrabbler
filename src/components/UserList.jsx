import { useContext } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { AuthContext } from "../context/auth.context";
import BlockIcon from '@mui/icons-material/Block';
import FastForwardIcon from '@mui/icons-material/FastForward';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TimerIcon from '@mui/icons-material/Timer';
import Timer from '../components/Timer';
import '@fontsource/roboto/700.css';
import { useSocket } from '../context/socket.context';

export default function UserList() {
    const User = useContext(AuthContext).user;
    const { roomId, hostId, usersInRoom, isActive, players } = useContext(RoomContext)
    const { turnPlayer, turnEndTime } = useContext(GameContext)
    const userList = isActive ? players : usersInRoom
    const socket = useSocket();

    function handleSkip(userId) {
      socket.emit('skipPlayer', roomId, userId)
    }

    function handleKick(user) {
      socket.emit('kickUser', roomId, user)
    }

  return (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {userList.map((user) => {
        const labelId = `checkbox-list-secondary-label-${user}`;
        return (
          <ListItem
            key={user._id}
            secondaryAction={
                (isActive && User._id === hostId && User._id !== user._id) && 
                <IconButton edge="end" aria-label="skip" disabled={!user.inactive} onClick={() => handleSkip(user._id)}>
                    <Tooltip title="Skip turns">
                        <FastForwardIcon />
                    </Tooltip>
                </IconButton>
            }
          >
            <ListItemAvatar>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={'👑'}
                    invisible={user._id !== hostId}
                >
                    <Avatar
                        alt={`Avatar n°${user + 1}`}
                        src={user.profilePic}
                    />
                </Badge>
            </ListItemAvatar>
            <ListItemText id={labelId} primary={user.name} sx={{
                fontWeight: isActive && turnPlayer && user._id === turnPlayer._id ? 'bold' : 'normal'
            }} />
            {(!isActive && User._id === hostId && User._id !== user._id) && (
              <IconButton edge="end" aria-label="kick" onClick={() => handleKick(user)}>
                <Tooltip title="Kick">
                  <BlockIcon />
                </Tooltip>
              </IconButton>
            )}
            {(isActive && turnPlayer && user._id === turnPlayer._id) &&
                <Chip icon={<TimerIcon />} label={
                    <Timer 
                        duration={(turnEndTime - Date.now()) / 1000} // Convert to seconds
                        onTimeout={() => {}} // The server will handle the timeout
                    />
                } 
                />
            }
            {isActive &&
                <Chip label={`${user.score || 0} points`} />
            }
          </ListItem>
        );
      })}
    </List>
  );
}