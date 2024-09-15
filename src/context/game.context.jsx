import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';

const GameContext = createContext();

function GameProvider(props) {
    const [board, setBoard] = useState(null);
    const [bank, setBank] = useState([]);
    const [placedLetters, setPlacedLetters] = useState([]);
    const [leftInBag, setLeftInBag] = useState('');
    const [turnPlayer, setTurnPlayer] = useState(null);
    const [turnEndTime, setTurnEndTime] = useState(null);
    const [turnNumber, setturnNumber] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [blank, setBlank] = useState(null);
    const [isLetterSelectlOpen, setIsLetterSelectlOpen] = useState(false);
    const [isLetterReplacelOpen, setIsLetterReplacelOpen] = useState(false);
    const [canClick, setCanClick] = useState(true);
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { setIsActive, setPlayers } = useContext(RoomContext)

    useEffect(() => {
      // Get non-DB game data when user joins (private)
      socket.on('refreshGame', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setPlayers(sessionData.players)
          setBank(sessionData.letterBank) 
          setTurnPlayer(sessionData.turnPlayer);
          setTurnEndTime(new Date(sessionData.turnEndTime).getTime());
          setturnNumber(sessionData.turnNumber)
      });

      // Listen for game updates (public)
      socket.on('gameUpdated', (sessionData) => {
          setBoard(sessionData.board);
          setLeftInBag(sessionData.leftInBag)
          setPlayers(sessionData.players)
      });

      // Listen for letter bank updates (private)
      socket.on('letterBankUpdated', (letterBank) => {
          setBank(letterBank)
          setPlacedLetters([]) // reset placed letters
      });

      // Listen for turn pass (private)
      socket.on('turnPassed', (letterBank, board) => {
        setBank(letterBank) // reset player's letter bank
        setBoard(board) // reset board
        setPlacedLetters([]) // reset placed letters
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
              setCanClick(true)
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
      socket.on('turnTimedOut', (letterBank, board) => {
          setBank(letterBank) // reset player's letter bank
          setBoard(board) // reset board
          setPlacedLetters([]) // reset placed letters
          setModalMessage("Your turn has timed out!");
          setIsModalOpen(true);
          timer = setTimeout(() => setIsModalOpen(false), 3000); // Auto-close after 3 seconds
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
      });

      // Listen for when player can be skipped (private for host)
      socket.on('playerCanBeSkipped', (players) => {
          setPlayers(players)
      });

      // Listen for when a new game starts (public)
      socket.on('gameStarted', (players) => {
          setIsActive(true)
      });

      // Listen for when a game ends (public)
      socket.on('gameEnded', () => {
          setIsActive(false)
          setPlayers([])
          setTurnPlayer(null); 
          setTurnEndTime(null); 
          setturnNumber(null);
          setBank([])
          setBoard(null)
          setPlacedLetters([])
          setLeftInBag('')
      });

      // Listen for when a move was rejected (private)
      socket.on('moveRejected', () => {
          setModalMessage("Some of your words are not valid!");
          setIsModalOpen(true);
          setCanClick(true)
          timer = setTimeout(() => setIsModalOpen(false), 3000); // Auto-close after 3 seconds
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
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
          socket.off('moveRejected');
          clearTimeout(timer);
      };
  }, [socket, User._id]);

    return (
        <GameContext.Provider value={{
            board, setBoard,
            bank, setBank,
            placedLetters, setPlacedLetters,
            leftInBag,
            turnPlayer,
            turnEndTime,
            turnNumber,
            isModalOpen, setIsModalOpen,
            modalMessage,
            blank, setBlank,
            isLetterSelectlOpen, setIsLetterSelectlOpen,
            isLetterReplacelOpen, setIsLetterReplacelOpen,
            canClick, setCanClick,
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };