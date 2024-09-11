import Grid2 from '@mui/material/Grid2';
import Tile from '../components/Tile';
import { GameContext } from '../context/game.context';
import { useContext } from 'react';

function Board() {
    const { board, boardSize } = useContext(GameContext)

  return (
    <>
    {board && (
    <Grid2 
        container 
        columns={boardSize}
        justifyContent="center"
        sx={{
            height: '100%',
            aspectRatio: '1 / 1', // Maintain a square aspect ratio
            //ml: 'auto',
            border: 'solid 3px brown',
            boxSizing: 'border-box',
            overflow: 'hidden',
        }}
        >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => (
                <Grid2 
                    item
                    key={`${rowIndex}-${colIndex}`}
                    sx={{
                        width: `calc(100% / ${boardSize})`, // Set width based on number of columns
                        height: `calc(100% / ${boardSize})`, // Set height based on number of rows
                    }}
                    >
                        <Tile tile={tile}/>
                </Grid2>
            )
        )
      )}
    </Grid2>
    )}
    </>
  );
};

export default Board;
