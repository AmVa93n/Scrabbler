import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { GameBoard, Tile, Player, TileOnBoard } from '../types';
import useRoom from '../hooks/useRoom';

const GameContext = createContext({} as Context);

interface Context {
    players: Player[],
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    board: GameBoard | null,
    setBoard: React.Dispatch<React.SetStateAction<GameBoard | null>>,
    rack: Tile[],
    setRack: React.Dispatch<React.SetStateAction<Tile[]>>,
    placedLetters: TileOnBoard[],
    setPlacedLetters: React.Dispatch<React.SetStateAction<TileOnBoard[]>>,
    leftInBag: number,
    resetTurnActions: () => void,
    reactionScore: number
}

function GameProvider(props: { children: React.ReactNode }) {
    const [players, setPlayers] = useState([] as Player[]);
    const [board, setBoard] = useState<GameBoard | null>(null);
    const [rack, setRack] = useState([] as Tile[]);
    const [placedLetters, setPlacedLetters] = useState([] as TileOnBoard[]);
    const [leftInBag, setLeftInBag] = useState(100);
    const [reactionScore, setReactionScore] = useState(0);
    const { socket } = useSocket();
    const { setRoom } = useRoom();

    function resetTurnActions() {
        if (board) {
            const clearedBoard = [...board] // reset any placed tiles
            for (const letter of placedLetters) {
                clearedBoard[letter.y][letter.x].content = null;
                clearedBoard[letter.y][letter.x].occupied = false;
            }
            setBoard(clearedBoard)
          }
          setRack(prev => [...prev, ...placedLetters]);
          setPlacedLetters([]);
    }

    useEffect(() => {
        if (!socket) return;
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
          setRoom(prev => prev ? ({...prev, gameSession: { settings: {rackSize, gameEnd: gameMode }}}) : null)
      });

      // Listen for when a game ends (public)
      socket.on('gameEnded', () => {
            setRoom(prev => prev ? ({...prev, gameSession: null}) : null)
            setPlayers([])
            setRack([])
            setBoard(null)
            setPlacedLetters([])
            setLeftInBag(100)
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