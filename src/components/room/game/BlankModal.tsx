import { useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid2, Paper, Typography } from '@mui/material';
import { GameContext } from '../../../context/game.context';
import { BlankContext } from '../../../context/modal.context';

function BlankModal() {
  const { setBoard } = useContext(GameContext)
  const { isLSelectOpen, setIsLSelectOpen, blank, setBlank } = useContext(BlankContext)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  function handleLetterSelect(selectedLetter: string) {
    if (blank) {
      // Update the blank tile with the chosen letter
      const { x, y } = blank;
      setBoard((prevBoard) => {
        if (!prevBoard) return null;
        const newBoard = [...prevBoard];
        newBoard[y][x].content!.letter = selectedLetter;
        return newBoard;
      });
      setBlank(null); // Reset after placement
      setIsLSelectOpen(false);
    }
  }

  return (
    <Dialog 
      open={isLSelectOpen} 
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