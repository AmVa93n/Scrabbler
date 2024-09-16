import { useContext } from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { useSocket } from '../context/socket.context';
import { RoomContext } from '../context/room.context';
import { AuthContext } from "../context/auth.context";
import { GameContext } from '../context/game.context';

function Reactions({ message }) {
  const { reactionTypes, reactionEmojis } = useContext(GameContext)
  const socket = useSocket();
  const User = useContext(AuthContext).user;
  const { roomId } = useContext(RoomContext)

  function handleReaction(reactionType) {
    if (!canReact(reactionType)) return
    socket.emit('reaction', roomId, message._id, User._id, reactionType)
  };

  function canReact(reactionType) {
    if (message.associatedWith === User._id) return false // can't react to your own generated msg
    if (alreadyReacted(reactionType)) return false // can't react more than once
    return true
  }

  function alreadyReacted(reactionType) {
    return message.reactions.some((reaction) => reaction.user === User._id && reaction.type === reactionType);
  }

  function getReactionsNumber(reactionType) {
    const number = message.reactions.filter((reaction) => reaction.type === reactionType).length;
    return number > 0 ? number : ''
  }

  return (
    <Box sx={{width: 'fit-content', mx: 'auto', display: 'flex'}}>
        {reactionTypes.map((reactionType, index) => (
            <Tooltip title={reactionType} key={`${message._id}-${reactionType}`}>
                <IconButton 
                    size='small'
                    sx={{color: 'black', cursor: canReact(reactionType) ? 'pointer' : 'default'}}
                    onClick={()=>handleReaction(reactionType)}
                    >
                    <Typography variant="h6">{reactionEmojis[index]}</Typography>
                    <Typography variant="body2">{` ${getReactionsNumber(reactionType)}`}</Typography>
                </IconButton>
          </Tooltip>
        ))}
    </Box>
  );
}

export default Reactions;