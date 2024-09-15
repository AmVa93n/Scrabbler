import Letter from '../components/Letter';
import { Paper } from '@mui/material';
import { GameContext } from '../context/game.context';
import { RoomContext } from '../context/room.context';
import { AuthContext } from "../context/auth.context";
import { useContext } from 'react';
import { useDrop } from 'react-dnd';

const ItemType = 'LETTER';

function LetterBank() {
    const { bank, setBoard, setBank, setPlacedLetters } = useContext(GameContext)
    const { bankSize, players } = useContext(RoomContext)
    const User = useContext(AuthContext).user;
    const isPlaying = players.find(player => player._id === User._id)

    const [{ isOver }, drop] = useDrop({
        accept: ItemType,
        drop: (letter) => handleDrop(letter),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      });

    function handleDrop(letter) {
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
            return newBoard;
        });
        // add letter to bank
        if (letter.isBlank) letter.letter = ''
        setBank(prevBank => prevBank.some(letterInBank => letterInBank.id === letter.id) ? prevBank : [...prevBank, letter]);
        // remove from letters placed this turn
        setPlacedLetters((prev) => prev.filter(placedLetter => placedLetter.id !== letter.id));
        
    };
  
    return (
        <>
        {(bank && isPlaying) && (
        <Paper 
            ref={drop}
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '5px', 
                padding: '5px', 
                bgcolor: isOver ? 'lightgrey' : 'grey',
                width: 35,
                height: ((35 * bankSize) + (5 * (bankSize-1))),
                //position: 'absolute',
            }}>
                {bank.map((letter) => (
                    <Letter 
                        key={letter.id} 
                        id={letter.id} 
                        letter={letter.letter}
                        isBlank={letter.isBlank}
                        points={letter.points}
                    />
                ))}
        </Paper>
        )}
        </>
    );
}

export default LetterBank;