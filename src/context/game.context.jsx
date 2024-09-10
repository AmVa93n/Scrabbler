import { createContext, useState, useEffect } from 'react';
import { useSocket } from '../context/socket.context';

const GameContext = createContext();

function GameProvider(props) {
    const boardSize = 15
    const bankSize = 7
    const [board, setBoard] = useState(null);
    const [bank, setBank] = useState([]);
    const [leftInBag, setLeftInBag] = useState(100);
    const socket = useSocket();

    useEffect(() => {
      // Get game data when user joins (that is not saved in DB)
      socket.on('refreshGame', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setBank(sessionData.letterBank) 
      });

      // Listen for game updates
      socket.on('gameUpdated', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
      });

      // Listen for letter bank updates (only to relevant player)
      socket.on('letterBankUpdated', (letterBank) => {
          setBank(letterBank)
      });

      // Clean up listeners on component unmount
      return () => {
          socket.off('refreshGame');
          socket.off('gameUpdated');
      };
  }, [socket]);

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
            boardSize,
            bankSize,
            leftInBag
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };