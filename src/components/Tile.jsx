import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';
import { AuthContext } from "../context/auth.context";
import { GameContext } from '../context/game.context';

const ItemType = 'LETTER';

function Tile({ id, letter, isBlank, points, fixed }) {
  const User = useContext(AuthContext).user;
  const { turnPlayer, placedLetters, board } = useContext(GameContext)

  const [{ isDragging, canDrag }, drag] = useDrag({
    type: ItemType,
    item: { id, letter, isBlank, points, fixed },
    canDrag: () => !fixed && turnPlayer && User._id === turnPlayer._id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  function needsToFit() {
    // letter needs to fit square size because it's too small for the default 35x35
    return board.length > 15 && (placedLetters.find(letter => letter.id === id) || fixed)
  }

  return (
    <Paper
      ref={drag}
      sx={{
        width: needsToFit() ? '97%' : 35,
        height: needsToFit() ? '97%' : 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDragging ? 'lightgrey' : placedLetters.find(letter => letter.id === id) ? 'lightgreen' : 'beige',
        cursor: canDrag ? 'move' : 'default',
        position: 'relative'
      }}
    >
      <Typography 
        variant="body2"
        sx={{fontWeight: 400, fontSize: 20, color: isBlank ? 'red' : 'black'}}
        >
          {letter}</Typography>
      <Typography 
        variant="body2"
        sx={{position: 'absolute', right: 1, bottom: 1, fontSize: 10}}
        >
          {points}</Typography>
    </Paper>
  );
}

export default Tile;