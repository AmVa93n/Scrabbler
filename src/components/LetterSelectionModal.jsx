import { useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid2, Paper, Typography } from '@mui/material';
import { GameContext } from '../context/game.context';

function LetterSelectionModal() {
  const { setBoard, isLetterSelectlOpen, setIsLetterSelectlOpen, blank, setBlank } = useContext(GameContext)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  function handleLetterSelect(selectedLetter) {
    if (blank) {
      // Update the blank tile with the chosen letter
      const { x, y } = blank;
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[y][x].content.letter = selectedLetter;
        return newBoard;
      });
      setBlank(null); // Reset after placement
      setIsLetterSelectlOpen(false);
    }
  }

  return (
    <Dialog 
      open={isLetterSelectlOpen} 
      >
      <DialogTitle>Select a Letter</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={1}>
          {letters.map((letter) => (
            <Grid2 item xs={3} key={letter}>
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

export default LetterSelectionModal;