import { Box, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import Letter from '../components/Letter';
import { GameContext } from '../context/game.context';
import { useContext } from 'react';

const ItemType = 'LETTER';

function Tile({ tile, isStart }) {
  const { setBoard, setBank, setPlacedLetters, setBlank, setIsLSelectOpen } = useContext(GameContext)

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
    
    setPlacedLetters((prevPlacedLetters) => {
      // Check if the letter is already on the board
      const letterIndex = prevPlacedLetters.findIndex(placedLetter => placedLetter.id === letter.id);
      if (letterIndex !== -1) { // If the letter is already on the board, update its coordinates
        const updatedLetters = [...prevPlacedLetters];
        updatedLetters[letterIndex] = { ...letter, x, y }; // Update with new coordinates
        return updatedLetters;
      } else {
        // If the letter is not in placedLetters, add it
        return [...prevPlacedLetters, { ...letter, x, y }];
      }
    });

    if (letter.isBlank) {
      // Trigger the modal for blank tile selection
      setBlank({ x, y, letter });
      setIsLSelectOpen(true);
    }
  };

  function getTileColor(bonus) {
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
        backgroundColor: isOver && canDrop ? 'yellow' : getTileColor(tile.bonusType),
        border: 'solid 1px white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {tile.content ? ( // Conditionally render the letter
        <Letter 
            id={tile.content.id} 
            letter={tile.content.letter} 
            isBlank={tile.content.isBlank} 
            points={tile.content.points}
            fixed={tile.fixed} 
          /> 
      ) : (
        isStart && (<Typography variant="h4">★</Typography>)
      )}
    </Box>
  );
}

export default Tile;
