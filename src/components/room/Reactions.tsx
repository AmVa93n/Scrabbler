import React, { useState } from 'react';
import { IconButton, Tooltip, Box, Typography, Popover, Grow } from '@mui/material';
import useSocket from '../../hooks/useSocket';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import useReactions from '../../hooks/useReactions';
import { Message } from '../../types';
import useAuth from '../../hooks/useAuth';
import { useParams } from 'react-router-dom';

function Reactions({ message }: { message: Message }) {
  const { reactionTypes, reactionEmojis } = useReactions()
  const { socket } = useSocket();
  const { user: User } = useAuth();
  const { roomId } = useParams();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const id = isPanelOpen ? 'reaction-popover' : undefined;

  function handleReaction(reactionType: string) {
    if (!canReact(reactionType)) return
    socket?.emit('reaction', roomId, message._id, User?._id, reactionType)
    closeReactionPanel()
  };

  function canReact(reactionType: string) {
    if (message.generatedBy === User?._id) return false // can't react to your own generated msg
    if (alreadyReacted(reactionType)) return false // can't react more than once
    return true
  }

  function alreadyReacted(reactionType: string) {
    return message.reactions.some((reaction) => reaction.user._id === User?._id && reaction.type === reactionType);
  }

  function getReactionsNumber(reactionType: string) {
    const number = message.reactions.filter((reaction) => reaction.type === reactionType).length;
    return number
  }

  function getReactors(reactionType: string) {
    const reactions = message.reactions.filter((reaction) => reaction.type === reactionType);
    const reactors = reactions.map(reaction => reaction.user.name)
    return reactors.join('\n')
  }

  function openReactionPanel(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
    setPanelOpen(true)
  };

  function closeReactionPanel() {
    setAnchorEl(null);
    setPanelOpen(false)
  };

  return (
    <Box sx={{width: 'fit-content', mx: 'auto', display: 'flex'}}>
        {reactionTypes.map((reactionType, index) => (
          getReactionsNumber(reactionType) > 0 &&
            <Tooltip 
              title={<Typography variant='inherit' sx={{whiteSpace: 'pre-line'}}>{getReactors(reactionType)}</Typography>} 
              key={`${message._id}-${reactionType}`}
              >
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

        {message.generatedBy !== User?._id &&
        <IconButton onClick={openReactionPanel}>
          <AddReactionIcon/>
        </IconButton>}

        <Popover
          id={id}
          open={isPanelOpen}
          anchorEl={anchorEl}
          onClose={closeReactionPanel}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          TransitionComponent={Grow}
          sx={{
            '& .MuiPopover-paper': {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '32px', // Rounded like a Chip
              backgroundColor: '#f0f0f0', // Chip-like background
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <Box>
            {reactionTypes.map((reactionType, index) => (
              <Tooltip title={reactionType} key={`${reactionType}-popover`}>
                <IconButton
                  size='small'
                  onClick={() => handleReaction(reactionType)}
                  sx={{ color: 'black' }}
                >
                  <Typography variant="h6">{reactionEmojis[index]}</Typography>
                </IconButton>
              </Tooltip>
            ))}
          </Box>
          
      </Popover>
    </Box>
  );
}

export default Reactions;