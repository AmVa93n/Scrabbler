import { createContext, useState } from 'react';

const GameContext = createContext();

function GameProvider(props) {
    const boardSize = 15
    const [board, setBoard] = useState(
        Array.from({ length: boardSize }, (_, row) =>
        Array.from({ length: boardSize }, (_, col) => ({
            x: col,
            y: row,
            occupied: false,
            content: null,
        }))
        )
    );
    //const BankSize = 7
    const [bank, setBank] = useState([
        { id: 1, letter: 'A', placed: false },
        { id: 2, letter: 'A', placed: false },
        { id: 3, letter: 'B', placed: false },
        { id: 4, letter: 'B', placed: false },
        { id: 5, letter: 'C', placed: false },
        { id: 6, letter: 'C', placed: false },
        { id: 7, letter: 'D', placed: false },
        // other letters
      ]);

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
        <GameContext.Provider value={{
            board,
            setBoard,
            handleDrop,
            bank,
            setBank,
            boardSize
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };