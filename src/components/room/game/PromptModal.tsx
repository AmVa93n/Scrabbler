import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, FormLabel, TextField, ToggleButtonGroup, ToggleButton, 
  Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useReactions from '../../../hooks/useReactions';
import useSocket from '../../../hooks/useSocket';
import useTurn from '../../../hooks/useTurn';

interface Props {
  open: boolean;
  onClose: () => void;
  setPromptData: React.Dispatch<React.SetStateAction<{promptText : string, targetReaction: string} | null>>;
  word: string | undefined
}

function PromptModal({ open, onClose, setPromptData, word }: Props) {
  const { reactionTypes, reactionEmojis } = useReactions()
  const { turnPlayer } = useTurn();
  const defaultText = `${turnPlayer?.name || '<player>'} was thinking about ${word?.toLowerCase() || '<word>'} because`
  const [text, setText] = useState(defaultText)
  const [reaction, setReaction] = useState('funny')
  const { socket } = useSocket();

  function handleConfirm() {
    setPromptData({ promptText: text, targetReaction: reaction });
    onClose()
  }

  function handleReset() {
    onClose()
    setPromptData(null)
    setText(defaultText)
    setReaction('funny')
  }

  function isPromptTextValid() {
    if (!word) return false
    if (text.trim() === word.toLowerCase()) return false // the prompt must include other words too
    if (text.includes(` ${word.toLowerCase()} `)) return true
    if (text.startsWith(`${word.toLowerCase()} `)) return true
    if (text.endsWith(` ${word.toLowerCase()}`)) return true
    return false
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
      onClose={onClose}
      >
      <DialogTitle>Customize Prompt</DialogTitle>
      <DialogContent sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        }}>

        <FormControl>
            <FormLabel htmlFor="promptText">{`Write a short prompt for the GPT to complete 
            \n(the word "${word?.toLowerCase()}" has to be included in the prompt)`}</FormLabel>
            <TextField
                name="promptText"
                required
                fullWidth
                value={text}
                onChange={(e) => setText(e.target.value)}
                multiline
                rows={3}
                slotProps={{
                    htmlInput: {maxLength: 50}
                }}
            />
        </FormControl>

        <FormControl>
            <FormLabel htmlFor="targetReaction">Choose the reaction you're aiming to get for the generated text</FormLabel>
            <ToggleButtonGroup
                value={reaction}
                onChange={(_, newReaction) => setReaction(newReaction)}
                exclusive
                size='small'
            >
                {reactionTypes.map((reaction, index) =>
                    <Tooltip title={reaction} key={`${reaction}-target`}>
                        <ToggleButton value={reaction}>
                            <Typography variant="h4">{reactionEmojis[index]}</Typography>
                        </ToggleButton>
                    </Tooltip>
                )}
            </ToggleButtonGroup>
        </FormControl>
          
      </DialogContent>

      <DialogActions>
        <Button 
            onClick={handleConfirm} 
            sx={{ textTransform: 'none' }} 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            disabled={!isPromptTextValid()}
            >
                    Confirm
                </Button>
        <Button 
            onClick={handleReset} 
            sx={{ textTransform: 'none' }} 
            >
                    Reset
                </Button>
      </DialogActions>
        
    </Dialog>
  );
}

export default PromptModal;