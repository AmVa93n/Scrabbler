import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';

const GameContext = createContext();

function GameProvider(props) {
    const boardSize = 15
    const bankSize = 7
    const [board, setBoard] = useState(null);
    const [bank, setBank] = useState([]);
    const [leftInBag, setLeftInBag] = useState(100);
    const [turnPlayer, setTurnPlayer] = useState(null);
    const [turnEndTime, setTurnEndTime] = useState(null);
    const [turnNumber, setturnNumber] = useState(0);
    const [inactivePlayerIds, setInactivePlayerIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { setIsActive, setPlayers } = useContext(RoomContext)

    useEffect(() => {
      // Get non-DB game data when user joins (private)
      socket.on('refreshGame', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setBank(sessionData.letterBank) 
          setTurnPlayer(sessionData.turnPlayer);
          setTurnEndTime(new Date(sessionData.turnEndTime).getTime());
          setturnNumber(sessionData.turnNumber)
          setInactivePlayerIds(sessionData.inactivePlayerIds)
      });

      // Listen for game updates (public)
      socket.on('gameUpdated', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
      });

      // Listen for letter bank updates (private)
      socket.on('letterBankUpdated', (letterBank) => {
          setBank(letterBank)
      });

      let timer;
      // Listen for turn start (public)
      socket.on('turnStarted', (sessionData) => {
          setTurnPlayer(sessionData.turnPlayer);
          setTurnEndTime(new Date(sessionData.turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
          setturnNumber(sessionData.turnNumber)
          if (sessionData.turnPlayer._id === User._id) { // this is private
              setModalMessage("It's your turn!");
              setIsModalOpen(true);
          }
          timer = setTimeout(() => setIsModalOpen(false), 3000); // Auto-close after 3 seconds
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
      });

      // Listen for turn end (public)
      socket.on('turnEnded', () => {
          setTurnPlayer(null); 
          setTurnEndTime(null); 
          setturnNumber(null);
      });
      
      // Listen for turn timeout (private)
      socket.on('turnTimedOut', (letterBank) => {
          setBank(letterBank) // reset player's letter bank
          setModalMessage("Your turn has timed out!");
          setIsModalOpen(true);
          timer = setTimeout(() => setIsModalOpen(false), 3000); // Auto-close after 3 seconds
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
      });

      // Listen for when player can be skipped (private for host)
      socket.on('playerCanBeSkipped', (inactivePlayerIds) => {
          setInactivePlayerIds(inactivePlayerIds)
      });

      // Listen for when a new game starts (public)
      socket.on('gameStarted', (players) => {
          setIsActive(true)
          setPlayers(players) // player list set from the server to ensure it's the same for everyone
      });

    // Listen for when a game ends (public)
    socket.on('gameEnded', () => {
          setIsActive(false)
          setPlayers([])
          setTurnPlayer(null); 
          setTurnEndTime(null); 
          setturnNumber(null);
      });

      // Clean up listeners on component unmount
      return () => {
          socket.off('refreshGame');
          socket.off('gameUpdated');
          socket.off('letterBankUpdated');
          socket.off('turnStarted');
          socket.off('turnEnded');
          socket.off('turnTimedOut');
          socket.off('playerCanBeSkipped');
          socket.off('gameStarted');
          socket.off('gameEnded');
          clearTimeout(timer);
      };
  }, [socket, User._id]);

    return (
        <GameContext.Provider value={{
            board,
            setBoard,
            bank,
            setBank,
            boardSize,
            bankSize,
            leftInBag,
            turnPlayer,
            turnEndTime,
            turnNumber,
            isModalOpen,
            setIsModalOpen,
            modalMessage,
            inactivePlayerIds,
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };