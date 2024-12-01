import { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid2, Paper, Typography } from '@mui/material';
import { RoomContext } from '../../../context/room.context';
import { GameContext } from '../../../context/game.context';
import { AuthContext } from "../../../context/auth.context";
import { useSocket } from '../../../context/socket.context';
import LoopIcon from '@mui/icons-material/Loop';
import { SwapContext } from '../../../context/modal.context';

function SwapModal() {
  const socket = useSocket();
  const User = useContext(AuthContext).user;
  const { roomId } = useContext(RoomContext)
  const { rack, placedLetters, leftInBag, resetTurnActions, players } = useContext(GameContext)
  const { isLReplaceOpen, setIsLReplaceOpen } = useContext(SwapContext)
  const isPlaying = players.find(player => player._id === User._id)
  const [selectedLetters, setSelectedLetters] = useState([])

  function handleLetterClick(letterId) {
    if (selectedLetters.includes(letterId)) {
        setSelectedLetters((prev) => prev.filter(id => id !== letterId));
    } else {
        setSelectedLetters(letters => [...letters, letterId]);
    }
  }

  async function handleSwap() {
    setIsLReplaceOpen(false)
    socket.emit('swapLetters', roomId, selectedLetters)
    setSelectedLetters([])
    resetTurnActions()
  }

  function handleCancel() {
    setIsLReplaceOpen(false)
    setSelectedLetters([])
  }

  return (
    <Dialog 
      open={isLReplaceOpen} 
      >
      <DialogTitle>Select Letters</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={1}>
          {isPlaying && [...rack, ...placedLetters].map((tile) => (
            <Grid2 xs={3} key={tile.id}>
              <Paper
                onClick={() => handleLetterClick(tile.id)}
                sx={{
                  width: 35,
                  height: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedLetters.includes(tile.id) ? 'lightgreen' : 'beige',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{fontWeight: 400, fontSize: 20}}
                  >
                  {tile.letter}</Typography>
                <Typography 
                  variant="body2"
                  sx={{position: 'absolute', right: 1, bottom: 1, fontSize: 10}}
                  >
                  {tile.points}</Typography>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>

      <DialogActions>
        <Button 
            onClick={handleSwap} 
            sx={{ textTransform: 'none' }} 
            variant="contained"
            startIcon={<LoopIcon />}
            disabled={selectedLetters.length < 1 || selectedLetters.length > leftInBag}
            >
                    Swap
                </Button>
        <Button 
            onClick={handleCancel} 
            sx={{ textTransform: 'none' }} 
            >
                    Cancel
                </Button>
      </DialogActions>
        
    </Dialog>
  );
}

export default SwapModal;