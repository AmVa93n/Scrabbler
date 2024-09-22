import Tile from './Tile';
import { Paper } from '@mui/material';
import { GameContext } from '../context/game.context';
import { RoomContext } from '../context/room.context';
import { AuthContext } from "../context/auth.context";
import { useContext } from 'react';
import { useDrop } from 'react-dnd';

const ItemType = 'LETTER';

function Rack() {
    const { rack, setBoard, setRack, setPlacedLetters } = useContext(GameContext)
    const { rackSize, players } = useContext(RoomContext)
    const User = useContext(AuthContext).user;
    const isPlaying = players.find(player => player._id === User._id)

    const [{ isOver }, drop] = useDrop({
        accept: ItemType,
        drop: (tile) => handleDrop(tile),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
    });

    function handleDrop(tile) {
        setBoard((prevBoard) => {
            const newBoard = [...prevBoard];
            // Find the previous position of the tile
            for (let row of newBoard) {
            for (let square of row) {
                if (square.content && square.content.id === tile.id) {
                    square.content = null; // Remove the tile from the previous square
                    square.occupied = false
                }
            }
            }
            return newBoard;
        });
        // add tile to rack
        if (tile.isBlank) tile.letter = ''
        setRack(prev => prev.some(tileOnRack => tileOnRack.id === tile.id) ? prev : [...prev, tile]);
        // remove from letters placed this turn
        setPlacedLetters((prev) => prev.filter(placedLetter => placedLetter.id !== tile.id));
        
    };
  
    return (
        <>
        {(rack && isPlaying) && (
        <Paper 
            ref={drop}
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '5px', 
                padding: '5px', 
                bgcolor: isOver ? 'lightgrey' : 'grey',
                width: 35,
                height: ((35 * rackSize) + (5 * (rackSize-1))),
                //position: 'absolute',
            }}>
                {rack.map((tile) => (
                    <Tile 
                        key={tile.id} 
                        id={tile.id} 
                        letter={tile.letter}
                        isBlank={tile.isBlank}
                        points={tile.points}
                    />
                ))}
        </Paper>
        )}
        </>
    );
}

export default Rack;