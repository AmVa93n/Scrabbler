import { useContext, useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import BlockIcon from '@mui/icons-material/Block';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Timer from './game/Timer';
import '@fontsource/roboto/700.css';
import useSocket from '../../hooks/useSocket';
import { keyframes } from '@mui/system';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StarIcon from '@mui/icons-material/Star';
import { TurnContext } from '../../context/turn.context';
import useAuth from '../../hooks/useAuth';
import { GameState, Player, User } from '../../types';
import useRoom from '../../hooks/useRoom';
import useGame from '../../hooks/useGame';

const shine = keyframes`
  from {background-position: 100% 0;}
  to {background-position: -100% 0;}
`

export default function UserList() {
    const { user: User } = useAuth();
    const { room, usersInRoom } = useRoom();
    const isActive = room?.gameSession !== null;
    const { players } = useGame();
    const { turnPlayer, turnEndTime } = useContext(TurnContext)
    const userList = isActive ? players.sort((a,b)=> b.score - a.score) : usersInRoom
    const { socket } = useSocket();
    const [reactionScore, setReactionScore] = useState(0);

    function handleKick(user: User) {
      socket?.emit('kickUser', room?._id, user)
    }

    useEffect(() => {
      if (!socket) return;

      const onRefresh = (sessionData: GameState) => {
        setReactionScore(sessionData.reactionScore)
      }
      const onReactionScoreUpdate = (newScore: number) => {
        setReactionScore(newScore)
      }
      const onGameEnd = () => {
        setReactionScore(0)
      }

      socket.on('reactionScoreUpdated', onReactionScoreUpdate); // Listen for when your reaction score increased (private)
      socket.on('refreshGame', onRefresh); // Get non-DB game data when user joins (private)
      socket.on('gameEnded', onGameEnd); // // Listen for when a game ends (public)

      return () => {
        socket.off('reactionScoreUpdated', onReactionScoreUpdate);
        socket.off('refreshGame', onRefresh);
        socket.off('gameEnded', onGameEnd);
      }
      
    }, [socket])

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
                    invisible={user._id !== room?.creator}
                >
                    <Avatar
                        alt={user.name}
                        src={user.profilePic}
                    />
                </Badge>
            </ListItemAvatar>
            <ListItemText id={labelId} primary={user.name} sx={{
                fontWeight: isActive && turnPlayer && user._id === turnPlayer._id ? 'bold' : 'normal'
            }} />
            {
              (!isActive && User?._id === room.creator && User?._id !== user._id) && 
              <Tooltip title="Kick">
                <IconButton edge="end" onClick={() => handleKick(user)}>
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            }
            {(isActive && turnPlayer && user._id === turnPlayer._id) && turnEndTime &&
              <Timer 
                duration={(turnEndTime - Date.now()) / 1000} // Convert to seconds
                onTimeout={() => {}} // The server will handle the timeout
              />
            }
            {(isActive && user._id === User?._id) &&
                <Chip icon={<EmojiEmotionsIcon />} label={reactionScore} 
                  sx={{
                    ml: 1,
                    backgroundColor: 'pink',
                  }}/>
            }
            {isActive &&
                <Chip icon={<StarIcon />} label={`${(user as Player).score || 0}`} 
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