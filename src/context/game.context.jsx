import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import appService from "../services/app.service";

const GameContext = createContext();

function GameProvider(props) {
    const [players, setPlayers] = useState([])
    const [board, setBoard] = useState(null);
    const [rack, setRack] = useState([]);
    const [placedLetters, setPlacedLetters] = useState([]);
    const [leftInBag, setLeftInBag] = useState('');
    const [turnPlayer, setTurnPlayer] = useState(null);
    const [turnEndTime, setTurnEndTime] = useState(null);
    const [turnNumber, setturnNumber] = useState(0);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [blank, setBlank] = useState(null);
    const [promptData, setPromptData] = useState(null)
    const [isLSelectOpen, setIsLSelectOpen] = useState(false);
    const [isLReplaceOpen, setIsLReplaceOpen] = useState(false);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isInactiveOpen, setIsInactiveOpen] = useState(false);
    const [canClick, setCanClick] = useState(true);
    const [reactionScore, setReactionScore] = useState(0);
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { setIsActive, setRackSize, setGameMode } = useContext(RoomContext)
    const reactionTypes = ['funny', 'wholesome', 'sad', 'suspicious', 'lie', 'embarassing', 'naughty', 'confusing']
    const reactionEmojis = ['🤣','🥰','😭','🧐','🤥','😳','😏','🤔']
    const autoClose = 2000

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

      // Listen for rack updates (private)
      socket.on('rackUpdated', (rack) => {
          setRack(rack)
          setPlacedLetters([]) // reset placed letters
      });

      let timer;
      // Listen for turn start (public)
      socket.on('turnStarted', async (sessionData) => {
          setTurnPlayer(sessionData.turnPlayer);
          setTurnEndTime(new Date(sessionData.turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
          setturnNumber(sessionData.turnNumber)
          if (sessionData.turnPlayer._id === User._id) { // this is private
              setAlertMessage("It's your turn!");
              setIsAlertOpen(true);
              setCanClick(true)
              await appService.ping()
          }
          timer = setTimeout(() => setIsAlertOpen(false), autoClose);
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
      });

      // Listen for turn end (public)
      socket.on('turnEnded', () => {
          setTurnPlayer(null); 
          setTurnEndTime(null); 
          setturnNumber(null);
      });
      
      // Listen for turn timeout (private)
      socket.on('turnTimedOut', (hasBecomeInactive) => {
          resetTurnActions()
          setIsLReplaceOpen(false) // close all task modals
          setIsLSelectOpen(false)
          setIsPromptOpen(false)

          if (hasBecomeInactive) {
            setIsInactiveOpen(true)
          } else {
            setAlertMessage("Your turn has timed out!");
            setIsAlertOpen(true);
            timer = setTimeout(() => setIsAlertOpen(false), autoClose);
            return () => clearTimeout(timer); // Clear the timeout if the component unmounts
          }
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
          setTurnPlayer(null); 
          setTurnEndTime(null); 
          setturnNumber(null);
          setRack([])
          setBoard(null)
          setPlacedLetters([])
          setLeftInBag('')
          setCanClick(true)
      });

      // Listen for when a move was rejected (private)
      socket.on('moveRejected', (invalidWords) => {
          setAlertMessage(`Some of your words are not valid: ${invalidWords.join(', ')}`);
          setIsAlertOpen(true);
          setCanClick(true)
          timer = setTimeout(() => setIsAlertOpen(false), autoClose);
          return () => clearTimeout(timer); // Clear the timeout if the component unmounts
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
          socket.off('turnStarted');
          socket.off('turnEnded');
          socket.off('turnTimedOut');
          socket.off('gameStarted');
          socket.off('gameEnded');
          socket.off('moveRejected');
          socket.off('reactionScoreUpdated');
          clearTimeout(timer);
      };
  }, [socket, User._id]);

    return (
        <GameContext.Provider value={{
            players, setPlayers,
            board, setBoard,
            rack, setRack,
            placedLetters, setPlacedLetters,
            leftInBag,
            turnPlayer,
            turnEndTime,
            turnNumber,
            isAlertOpen, setIsAlertOpen,
            alertMessage,
            blank, setBlank,
            promptData, setPromptData,
            resetTurnActions,
            isLSelectOpen, setIsLSelectOpen,
            isLReplaceOpen, setIsLReplaceOpen,
            isPromptOpen, setIsPromptOpen,
            isInactiveOpen, setIsInactiveOpen,
            canClick, setCanClick,
            reactionTypes, 
            reactionEmojis,
            reactionScore
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };