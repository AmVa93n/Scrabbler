import { Box, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import Tile from './Tile';
import { GameContext } from '../../../context/game.context';
import { useContext } from 'react';

const ItemType = 'LETTER';

function Square({ square, isStart }) {
  const { setBoard, setRack, setPlacedLetters, setBlank, setIsLSelectOpen } = useContext(GameContext)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemType,
    canDrop: () => !square.occupied,
    drop: (letter) => handleDrop(square.x, square.y, letter),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  function handleDrop(x, y, tile) {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      // Find the previous position of the letter
      for (let row of newBoard) {
        for (let square of row) {
          if (square.content && square.content.id === tile.id) {
            square.content = null; // Remove the letter from the previous square
            square.occupied = false
          }
        }
      }
      // Place the letter in the new square
      newBoard[y][x].content = tile;
      newBoard[y][x].occupied = true;
      return newBoard;
    });

    // remove letter from rack
    setRack((prev) => prev.filter(tileOnRack => tileOnRack.id !== tile.id));
    
    setPlacedLetters((prevPlacedLetters) => {
      // Check if the letter is already on the board
      const letterIndex = prevPlacedLetters.findIndex(placedLetter => placedLetter.id === tile.id);
      if (letterIndex !== -1) { // If the letter is already on the board, update its coordinates
        const updatedLetters = [...prevPlacedLetters];
        updatedLetters[letterIndex] = { ...tile, x, y }; // Update with new coordinates
        return updatedLetters;
      } else {
        // If the letter is not in placedLetters, add it
        return [...prevPlacedLetters, { ...tile, x, y }];
      }
    });

    if (tile.isBlank) {
      // Trigger the modal for blank tile selection
      setBlank({ x, y, tile });
      setIsLSelectOpen(true);
    }
  };

  function getSquareColor(bonus) {
    switch(bonus) {
      case 'quadrupleWord': return '#CC0000'
      case 'tripleWord': return '#FF3333'
      case 'doubleWord': return '#FF9999'
      case 'quadrupleLetter': return '#0066CC'
      case 'tripleLetter': return '#3399FF'
      case 'doubleLetter': return '#99CCFF'
      default: return '#F5DEB3'
    }
  }

  return (
    <Box
      ref={drop}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: isOver && canDrop ? 'yellow' : getSquareColor(square.bonusType),
        border: 'solid 1px white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {square.content ? ( // Conditionally render the letter
        <Tile 
            id={square.content.id} 
            letter={square.content.letter} 
            isBlank={square.content.isBlank} 
            points={square.content.points}
            fixed={square.fixed} 
          /> 
      ) : (
        isStart && (<Typography variant="h4">★</Typography>)
      )}
    </Box>
  );
}

export default Square;
