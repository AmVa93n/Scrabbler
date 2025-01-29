import { useContext, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid2, Paper, Typography } from '@mui/material';
import { GameContext } from '../../../context/game.context';
import useSocket from '../../../hooks/useSocket';

interface Props {
  open: boolean;
  onClose: () => void;
  tileCoords: { x: number; y: number };
}

function BlankModal({ open, onClose, tileCoords }: Props) {
  const { setBoard } = useContext(GameContext)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const { socket } = useSocket();

  function handleLetterSelect(selectedLetter: string) {
    // Update the blank tile with the chosen letter
    const { x, y } = tileCoords;
    setBoard((prevBoard) => {
      if (!prevBoard) return null;
      const newBoard = [...prevBoard];
      newBoard[y][x].content!.letter = selectedLetter;
      return newBoard;
    });
    onClose();
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
      <DialogTitle>Select a Letter</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={1}>
          {letters.map((letter) => (
            <Grid2 key={letter}>
              <Paper
                onClick={() => handleLetterSelect(letter)}
                sx={{
                  width: 35,
                  height: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'beige',
                  cursor: 'pointer',
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{fontWeight: 400, fontSize: 20}}
                  >
                    {letter}</Typography>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
    </Dialog>
  );
}

export default BlankModal;