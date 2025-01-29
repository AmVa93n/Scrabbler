import { useContext, useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid2, Paper, Typography } from '@mui/material';
import { GameContext } from '../../../context/game.context';
import useSocket from '../../../hooks/useSocket';
import LoopIcon from '@mui/icons-material/Loop';
import useAuth from '../../../hooks/useAuth';
import { useParams } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

function SwapModal({ open, onClose }: Props) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { roomId } = useParams();
  const { rack, placedLetters, leftInBag, resetTurnActions, players } = useContext(GameContext)
  const isPlaying = players.find(player => player._id === user?._id)
  const [selectedLetters, setSelectedLetters] = useState([] as number[])

  function handleLetterClick(letterId: number) {
    if (selectedLetters.includes(letterId)) {
        setSelectedLetters((prev) => prev.filter(id => id !== letterId));
    } else {
        setSelectedLetters(letters => [...letters, letterId]);
    }
  }

  async function handleSwap() {
    socket?.emit('swapLetters', roomId, selectedLetters)
    setSelectedLetters([])
    resetTurnActions()
    onClose()
  }

  function handleCancel() {
    setSelectedLetters([])
    onClose()
  }

  useEffect(() => {
    if (!socket) return;
    socket.on('turnTimedOut', onClose); // Listen for turn timeout (private)
    return () => { // Clean up listeners on component unmount
      socket.off('turnTimedOut', onClose)
    };
  }, [socket]);

  return (
    <Dialog 
      open={open} 
      >
      <DialogTitle>Select Letters</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={1}>
          {isPlaying && [...rack, ...placedLetters].map((tile) => (
            <Grid2 key={tile.id}>
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