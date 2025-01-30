import Tile from './Tile';
import { Paper } from '@mui/material';
import { useDrop } from 'react-dnd';
import { Tile as TileType, GameBoard, TileOnBoard } from '../../../types';

const ItemType = 'LETTER';

interface Props {
    tilesOnRack: TileType[],
    setTilesOnRack: React.Dispatch<React.SetStateAction<TileType[]>>,
    setBoard: React.Dispatch<React.SetStateAction<GameBoard | null>>,
    setTilesPlacedThisTurn: React.Dispatch<React.SetStateAction<TileOnBoard[]>>,
    rackSize: number
}

function Rack({ tilesOnRack, setTilesOnRack, setBoard, setTilesPlacedThisTurn, rackSize }: Props) {

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
        setTilesOnRack(prev => prev.some(tileOnRack => tileOnRack.id === tile.id) ? prev : [...prev, tile]);
        // remove from letters placed this turn
        setTilesPlacedThisTurn((prev) => prev.filter(placedLetter => placedLetter.id !== tile.id));
        
    };
  
    return (
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
                {tilesOnRack.map((tile) => (
                    <Tile 
                        key={tile.id} 
                        tile={tile}
                        isOnRack={true}
                        isOnBoard={false}
                        wasPlacedThisTurn={false}
                    />
                ))}
        </Paper>
    );
}

export default Rack;