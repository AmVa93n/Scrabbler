import Tile from './Tile';
import { Paper } from '@mui/material';
import { GameContext } from '../../../context/game.context';
import { useContext } from 'react';
import { useDrop } from 'react-dnd';
import useAuth from '../../../hooks/useAuth';
import { Tile as TileType } from '../../../types';
import useRoom from '../../../hooks/useRoom';

const ItemType = 'LETTER';

function Rack() {
    const { rack, setBoard, setRack, setPlacedLetters, players } = useContext(GameContext)
    const { room } = useRoom();
    const rackSize = room?.gameSession?.settings.rackSize || 7;
    const { user } = useAuth();
    const isPlaying = players.find(player => player._id === user?._id)

    const [{ isOver }, drop] = useDrop({
        accept: ItemType,
        drop: (tile: TileType) => handleDrop(tile),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
    });

    function handleDrop(tile: TileType) {
        setBoard((prevBoard) => {
            if (!prevBoard) return prevBoard;
            const newBoard = [...prevBoard];
            // Find the previous position of the tile
            for (const row of newBoard) {
            for (const square of row) {
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
                        fixed={false}
                    />
                ))}
        </Paper>
        )}
        </>
    );
}

export default Rack;