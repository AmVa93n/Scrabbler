import { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid2, Paper, Typography } from '@mui/material';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { AuthContext } from "../context/auth.context";
import { useSocket } from '../context/socket.context';
import LoopIcon from '@mui/icons-material/Loop';

function LetterReplaceModal() {
  const socket = useSocket();
  const User = useContext(AuthContext).user;
  const { roomId, players } = useContext(RoomContext)
  const isPlaying = players.find(player => player._id === User._id)
  const { bank, placedLetters, leftInBag, isLReplaceOpen, setIsLReplaceOpen } = useContext(GameContext)
  const [selectedLetters, setSelectedLetters] = useState([])

  function handleLetterClick(letterId) {
    if (selectedLetters.includes(letterId)) {
        setSelectedLetters((prev) => prev.filter(id => id !== letterId));
    } else {
        setSelectedLetters(letters => [...letters, letterId]);
    }
  }

  async function handleReplace() {
    setIsLReplaceOpen(false)
    socket.emit('replaceLetters', roomId, selectedLetters)
    setSelectedLetters([])
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
          {isPlaying && [...bank, ...placedLetters].map((letter) => (
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
      </DialogContent>

      <DialogActions>
        <Button 
            onClick={handleReplace} 
            sx={{ textTransform: 'none' }} 
            variant="contained"
            startIcon={<LoopIcon />}
            disabled={selectedLetters.length < 1 || selectedLetters.length > leftInBag}
            >
                    Replace
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

export default LetterReplaceModal;