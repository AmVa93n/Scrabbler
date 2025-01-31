import { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton, Avatar, Tooltip, Badge, Chip } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import Timer from './game/Timer';
import '@fontsource/roboto/700.css';
import useSocket from '../../hooks/useSocket';
import { keyframes } from '@mui/system';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StarIcon from '@mui/icons-material/Star';
import useAuth from '../../hooks/useAuth';
import { GameState, Player, User } from '../../types';
import useRoom from '../../hooks/useRoom';
import useGame from '../../hooks/useGame';
import useTurn from '../../hooks/useTurn';

const shine = keyframes`
  from {background-position: 100% 0;}
  to {background-position: -100% 0;}
`

export default function UserList({ type }: { type: 'players' | 'spectators' }) {
    const { user: User } = useAuth();
    const { room, usersInRoom } = useRoom();
    const isActive = room?.gameSession !== null;
    const { players } = useGame();
    const spectators = usersInRoom.filter(user => !players.find(player => player._id === user._id)) // Get users who are not players
    const { turnPlayer, turnEndTime } = useTurn();
    const userList = type === "players" ? players.sort((a,b)=> b.score - a.score) : spectators
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
    <>
      <Typography variant="h6">{type === "players" ? 'Players' : 'Spectators'}</Typography>
      <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', flex: 1, overflowY: 'auto' }}>
        {userList.map((user) => (
            <ListItem key={user._id} 
              sx={{ 
                borderRadius: 1, 
                bgcolor: user._id === turnPlayer?._id ? 'lightgreen' : type === "players" ? 'rgb(0, 0, 0, 0.1)': 'default',
                marginBottom: 1,
              }}>
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
              <ListItemText 
                primary={user.name} 
                slotProps= {{primary: { sx: { fontWeight: user._id === turnPlayer?._id ? 'bold' : 'normal' }}}}/>
              { type === "players" && <>
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
              </>}
            </ListItem>
          ))}
      </List>
    </>
  );
}