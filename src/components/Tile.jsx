import { Paper, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import Letter from '../components/Letter';
import { GameContext } from '../context/game.context';
import { useContext } from 'react';

const ItemType = 'LETTER';

function Tile({ tile }) {
  const { setBoard, setBank } = useContext(GameContext)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemType,
    canDrop: () => !tile.occupied,
    drop: (letter) => handleDrop(tile.x, tile.y, letter),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  function handleDrop(x, y, letter) {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      // Find the previous position of the letter
      for (let row of newBoard) {
        for (let tile of row) {
          if (tile.content && tile.content.id === letter.id) {
            tile.content = null; // Remove the letter from the previous tile
            tile.occupied = false
          }
        }
      }
      // Place the letter in the new tile
      newBoard[y][x].content = letter;
      newBoard[y][x].occupied = true;
      return newBoard;
    });
    // remove letter from bank
    setBank((prevBank) => prevBank.filter(letterInBank => letterInBank.id !== letter.id));
  };

  return (
    <Paper
      ref={drop}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: isOver && canDrop ? 'yellow' : 'beige',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {tile.content ? (
        <Letter id={tile.content.id} letter={tile.content.letter} /> // Conditionally render the letter
      ) : (
        <Typography variant="body2">{`${tile.x}, ${tile.y}`}</Typography>
      )}
    </Paper>
  );
}

export default Tile;
