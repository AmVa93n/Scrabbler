import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { RoomContext } from '../context/room.context';

const GameContext = createContext();

function GameProvider(props) {
    const [players, setPlayers] = useState([])
    const [board, setBoard] = useState(null);
    const [rack, setRack] = useState([]);
    const [placedLetters, setPlacedLetters] = useState([]);
    const [leftInBag, setLeftInBag] = useState('');
    const [reactionScore, setReactionScore] = useState(0);
    const socket = useSocket();
    const { setIsActive, setRackSize, setGameMode } = useContext(RoomContext)

    function resetTurnActions() {
        if (board) {
            const clearedBoard = [...board] // reset any placed tiles
            for (let letter of placedLetters) {
                clearedBoard[letter.y][letter.x].content = null;
                clearedBoard[letter.y][letter.x].occupied = false;
            }
            setBoard(clearedBoard)
          }
          setRack(prev => [...prev, ...placedLetters]);
          setPlacedLetters([]);
    }

    useEffect(() => {
      // Get non-DB game data when user joins (private)
      socket.on('refreshGame', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setPlayers(sessionData.players)
          setRack(sessionData.rack) 
          setReactionScore(sessionData.reactionScore)
      });

      // Listen for game updates (public)
      socket.on('gameUpdated', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setPlayers(sessionData.players)
      });

      // Listen for rack updates (private)
      socket.on('rackUpdated', (rack) => {
          setRack(rack)
          setPlacedLetters([]) // reset placed letters
      });
      
      // Listen for turn timeout (private)
      socket.on('turnTimedOut', () => {
          resetTurnActions()
      });

      // Listen for when a new game starts (public)
      socket.on('gameStarted', (rackSize, gameMode) => {
          setIsActive(true)
          setRackSize(rackSize)
          setGameMode(gameMode)
      });

      // Listen for when a game ends (public)
      socket.on('gameEnded', () => {
          setIsActive(false)
          setPlayers([])
          setRack([])
          setBoard(null)
          setPlacedLetters([])
          setLeftInBag('')
          setReactionScore(0)
      });

      // Listen for when your reaction score increased (private)
      socket.on('reactionScoreUpdated', (newScore) => {
          setReactionScore(newScore)
      });

      // Clean up listeners on component unmount
      return () => {
          socket.off('refreshGame');
          socket.off('gameUpdated');
          socket.off('rackUpdated');
          socket.off('turnTimedOut');
          socket.off('gameStarted');
          socket.off('gameEnded');
          socket.off('reactionScoreUpdated');
      };
  }, [socket]);

    return (
        <GameContext.Provider value={{
            players, setPlayers,
            board, setBoard,
            rack, setRack,
            placedLetters, setPlacedLetters,
            leftInBag,
            resetTurnActions,
            reactionScore
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };