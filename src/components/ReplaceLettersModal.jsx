import { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Grid2, Paper, Typography } from '@mui/material';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { useSocket } from '../context/socket.context';

function LetterReplaceModal() {
  const socket = useSocket();
  const { roomId } = useContext(RoomContext)
  const { bank, placedLetters, leftInBag, isLetterReplacelOpen, setIsLetterReplacelOpen } = useContext(GameContext)
  const [selectedLetters, setSelectedLetters] = useState([])

  function handleLetterClick(letterId) {
    if (selectedLetters.includes(letterId)) {
        setSelectedLetters((prev) => prev.filter(id => id !== letterId));
    } else {
        setSelectedLetters(letters => [...letters, letterId]);
    }
  }

  function handleReplace() {
    setIsLetterReplacelOpen(false)
    socket.emit('replaceLetters', roomId, selectedLetters)
    setSelectedLetters([])
  }

  function handleCancel() {
    setIsLetterReplacelOpen(false)
    setSelectedLetters([])
  }

  return (
    <Dialog 
      open={isLetterReplacelOpen} 
      >
      <DialogTitle>Select Letters</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={1}>
          {[...bank, ...placedLetters].map((letter) => (
            <Grid2 item xs={3} key={letter.id}>
              <Paper
                onClick={() => handleLetterClick(letter.id)}
                sx={{
                  width: 35,
                  height: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedLetters.includes(letter.id) ? 'lightgreen' : 'beige',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{fontWeight: 400, fontSize: 20}}
                  >
                  {letter.letter}</Typography>
                <Typography 
                  variant="body2"
                  sx={{position: 'absolute', right: 1, bottom: 1, fontSize: 10}}
                  >
                  {letter.points}</Typography>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
        <Button 
            onClick={handleReplace} 
            sx={{ mt: 2 }} 
            variant="contained"
            disabled={selectedLetters.length < 1 || selectedLetters.length > leftInBag}
            >
                    Replace
                </Button>
        <Button 
            onClick={handleCancel} 
            sx={{ mt: 2 }} 
            variant="contained" 
            color='secondary'>
                    Cancel
                </Button>
      </DialogContent>
    </Dialog>
  );
}

export default LetterReplaceModal;