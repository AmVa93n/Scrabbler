import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid2, Paper, Typography } from '@mui/material';
import useSocket from '../../../hooks/useSocket';
import LoopIcon from '@mui/icons-material/Loop';
import { useParams } from 'react-router-dom';
import { Tile } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  tiles: Tile[];
  leftInBag: number;
  resetTurnActions: () => void;
}

function SwapModal({ open, onClose, tiles, leftInBag, resetTurnActions }: Props) {
  const { socket } = useSocket();
  const { roomId } = useParams();
  const [selectedTiles, setSelectedTiles] = useState([] as number[])

  function handleLetterClick(letterId: number) {
    if (selectedTiles.includes(letterId)) {
        setSelectedTiles((prev) => prev.filter(id => id !== letterId));
    } else {
        setSelectedTiles(letters => [...letters, letterId]);
    }
  }

  async function handleSwap() {
    socket?.emit('swapLetters', roomId, selectedTiles)
    setSelectedTiles([])
    resetTurnActions()
    onClose()
  }

  function handleCancel() {
    setSelectedTiles([])
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
          {tiles.map((tile) => (
            <Grid2 key={tile.id}>
              <Paper
                onClick={() => handleLetterClick(tile.id)}
                sx={{
                  width: 35,
                  height: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedTiles.includes(tile.id) ? 'lightgreen' : 'beige',
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
            disabled={selectedTiles.length < 1 || selectedTiles.length > leftInBag}
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