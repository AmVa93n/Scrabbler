import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';

const ItemType = 'LETTER';

function Letter({ id, letter }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id, letter },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
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
        backgroundColor: isDragging ? 'lightgrey' : 'white',
        cursor: 'move',
      }}
    >
      <Typography variant="body2">{letter}</Typography>
    </Paper>
  );
}

export default Letter;