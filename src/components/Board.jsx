import Grid2 from '@mui/material/Grid2';
import Square from '../components/Square';
import { GameContext } from '../context/game.context';
import { useContext } from 'react';

function Board() {
    const { board } = useContext(GameContext)
    const boardSize = board?.length

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
        row.map((square, colIndex) => (
                <Grid2 
                    key={`${rowIndex}-${colIndex}`}
                    sx={{
                        width: `calc(100% / ${boardSize})`, // Set width based on number of columns
                        height: `calc(100% / ${boardSize})`, // Set height based on number of rows
                    }}
                    >
                        <Square square={square} isStart={rowIndex === boardSize/2-0.5 && colIndex === boardSize/2-0.5}/>
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
