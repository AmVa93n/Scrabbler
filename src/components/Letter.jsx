import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';
import { AuthContext } from "../context/auth.context";
import { GameContext } from '../context/game.context';

const ItemType = 'LETTER';

function Letter({ id, letter, isBlank, fixed }) {
  const User = useContext(AuthContext).user;
  const { turnPlayer } = useContext(GameContext)

  const [{ isDragging, canDrag }, drag] = useDrag({
    type: ItemType,
    item: { id, letter, isBlank, fixed },
    canDrag: () => !fixed && turnPlayer && User._id === turnPlayer._id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  return (
    <Paper
      ref={drag}
      sx={{
        width: 35,
        height: 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDragging ? 'lightgrey' : fixed ? 'white' : 'beige',
        cursor: canDrag ? 'move' : 'default'
      }}
    >
      <Typography variant="body2">{letter}</Typography>
    </Paper>
  );
}

export default Letter;