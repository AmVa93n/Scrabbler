import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';
import { TurnContext } from '../../../context/turn.context';
import useAuth from '../../../hooks/useAuth';
import useGame from '../../../hooks/useGame';
import { Tile as TileType } from '../../../types';

const ItemType = 'LETTER';

interface Props {
  tile: TileType;
  isOnRack: boolean;
  isOnBoard: boolean;
  wasPlacedThisTurn: boolean;
}

function Tile({ tile, isOnRack, isOnBoard, wasPlacedThisTurn }: Props) {
  const { user } = useAuth();
  const { board } = useGame();
  const { turnPlayer } = useContext(TurnContext)
  const isDraggable = isOnRack || (isOnBoard && wasPlacedThisTurn);

  const [{ isDragging, canDrag }, drag] = useDrag({
    type: ItemType,
    item: tile,
    canDrag: () => isDraggable && user?._id === turnPlayer?._id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  function needsToFit() {
    // letter needs to fit square size because it's too small for the default 35x35
    return board!.length > 15 && isOnBoard
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
        backgroundColor: isDragging ? 'lightgrey' : wasPlacedThisTurn ? 'lightgreen' : 'beige',
        cursor: canDrag ? 'move' : 'default',
        position: 'relative'
      }}
    >
      <Typography 
        variant="body2"
        sx={{fontWeight: 400, fontSize: 20, color: tile.isBlank ? 'red' : 'black'}}
        >
          {tile.letter}</Typography>
      <Typography 
        variant="body2"
        sx={{position: 'absolute', right: 1, bottom: 1, fontSize: 10}}
        >
          {tile.points}</Typography>
    </Paper>
  );
}

export default Tile;