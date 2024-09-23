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
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Timer from '../components/Timer';
import '@fontsource/roboto/700.css';
import { useSocket } from '../context/socket.context';
import { keyframes } from '@mui/system';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StarIcon from '@mui/icons-material/Star';

const shine = keyframes`
  from {background-position: 100% 0;}
  to {background-position: -100% 0;}
`

export default function UserList() {
    const User = useContext(AuthContext).user;
    const { roomId, hostId, usersInRoom, isActive } = useContext(RoomContext)
    const { turnPlayer, turnEndTime, reactionScore, players } = useContext(GameContext)
    const userList = isActive ? players : usersInRoom
    const socket = useSocket();

    function handleKick(user) {
      socket.emit('kickUser', roomId, user)
    }

  return (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', flex: 1, overflowY: 'auto' }}>
      {userList.map((user) => {
        const labelId = `checkbox-list-secondary-label-${user}`;
        return (
          <ListItem key={user._id}>
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
            {
              (!isActive && User._id === hostId && User._id !== user._id) && 
              <Tooltip title="Kick">
                <IconButton edge="end" onClick={() => handleKick(user)}>
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            }
            {(isActive && turnPlayer && user._id === turnPlayer._id) &&
              <Timer 
                duration={(turnEndTime - Date.now()) / 1000} // Convert to seconds
                onTimeout={() => {}} // The server will handle the timeout
              />
            }
            {(isActive && user._id === User._id) &&
                <Chip icon={<EmojiEmotionsIcon />} label={reactionScore} 
                  sx={{
                    ml: 1,
                    backgroundColor: 'pink',
                  }}/>
            }
            {isActive &&
                <Chip icon={<StarIcon />} label={`${user.score || 0}`} 
                      sx={{
                        ml: 1,
                        backgroundImage: 'linear-gradient(135deg, gold 25%, white 50%, gold 75%)',
                        backgroundSize: '200% 100%',
                        animation: `${shine} 3s linear infinite`,
                      }} />
            }
          </ListItem>
        );
      })}
    </List>
  );
}