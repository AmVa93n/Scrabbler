import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import accountService from "../services/account.service";
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { useNotifications } from '@toolpad/core/useNotifications';
import Timer from '../components/Timer';
import TurnAlertModal from '../components/TurnAlertModal';

function RoomPage() {
    const [room, setRoom] = useState(null)
    const { roomId } = useParams();
    const [usersWaiting, setUsersWaiting] = useState([])
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const notifications = useNotifications();
    const [turnPlayer, setTurnPlayer] = useState(null);
    const [turnEndTime, setTurnEndTime] = useState(null);
    const [turnNumber, setturnNumber] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        async function init() {
            try {
                const room = await accountService.getRoom(roomId)
                setRoom(room)
                socket.emit('joinRoom', roomId);
            } catch (error) {
                const errorDescription = error.response.data.message;
                alert(errorDescription);
            }
        }
        init()

        // Get room state when user joins
        socket.on('initRoomState', (waitingUsers, sessionData) => {
            setUsersWaiting(waitingUsers);
            if (sessionData) {
                setTurnPlayer(sessionData.turnPlayer);
                setTurnEndTime(new Date(sessionData.turnEndTime).getTime());
                setturnNumber(sessionData.turnNumber)
            }
        });

        // Listen for players joining the room
        socket.on('userJoined', (user) => {
            // Check if the user is already in the players array by comparing IDs
            setUsersWaiting((prevUsers) => {
                const isUserAlreadyIn = prevUsers.some(waitingUser => waitingUser._id === user._id);
                if (isUserAlreadyIn) return prevUsers;  // Return previous players if already in the list
                return [...prevUsers, user];  // Add the new user if not already present
            });
        });

        // Listen for players leaving the room
        socket.on('userLeft', (user) => {
            setUsersWaiting((prevPlayers) => prevPlayers.filter(player => player._id !== user._id));
        });

        // Listen for room updates by the host
        socket.on('roomUpdated', (updatedRoom) => {
            setRoom(updatedRoom);
        });

        socket.on('turnStart', (turnPlayer, turnEndTime, turnNumber) => {
            // Update UI to indicate it's the current player's turn
            setTurnPlayer(turnPlayer);
            setTurnEndTime(new Date(turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
            setturnNumber(turnNumber)
            if (turnPlayer._id === User._id) {
                setModalMessage("It's your turn!");
                setIsModalOpen(true);
            }
            // Auto-close the modal after 3 seconds
            const timer = setTimeout(() => setIsModalOpen(false), 3000);
            // Clear the timeout if the component unmounts
            return () => clearTimeout(timer);
        });
        
        socket.on('turnTimeout', (turnPlayer) => {
            // Notify the UI that the player’s turn timed out
            if (turnPlayer._id === User._id) {
                setModalMessage("Your turn has timed out!");
                setIsModalOpen(true);
            }
            // Auto-close the modal after 3 seconds
            const timer = setTimeout(() => setIsModalOpen(false), 3000);
            // Clear the timeout if the component unmounts
            return () => clearTimeout(timer);
        });
        
        //socket.on('userMove', (moveData) => {
            // Update game state with the move made by the player
            //updateGameState(moveData);
        //});

        // Clean up listeners on component unmount
        return () => {
            socket.off('initRoomState');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('roomUpdated');
            socket.off('turnStart');
            socket.off('turnTimeout');
            //socket.off('userMove');
        };
    }, [roomId, socket, User._id])

    async function handleStartGame() {
        const requestBody = {
            name: room.name,
            gameSession: {
                players: [...usersWaiting]
            },
            kickedUsers: room.kickedUsers,
        };
        try {
            const updatedRoom = await accountService.updateRoom(roomId, requestBody)
            notify('Successfully started game!','success',5000)
            setRoom(updatedRoom)
            socket.emit('updateRoom', roomId, updatedRoom)
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
    }

    async function handleEndGame() {
        const requestBody = {
            name: room.name,
            gameSession: null,
            kickedUsers: room.kickedUsers,
        };
        try {
            const updatedRoom = await accountService.updateRoom(roomId, requestBody)
            notify('Successfully ended game!','success',5000)
            setRoom(updatedRoom)
            socket.emit('updateRoom', roomId, updatedRoom)
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
    }

    function handleMakeMove() {
        const moveData = {}
        socket.emit('makeMove', roomId, moveData)
    }

    function notify(message, type, duration) {
        notifications.show(message, {
          severity: type,
          autoHideDuration: duration,
        });
    }

    return (
        <div>
            {room ? (
                <>
                    <h1>{room.name}</h1>
                    {room.gameSession ? (
                        <div>
                            <TurnAlertModal isOpen={isModalOpen} message={modalMessage} onClose={() => setIsModalOpen(false)} />
                            <h2>Game is active</h2>
                            <p>Turn {turnNumber}</p>
                            <p>it is {turnPlayer ? turnPlayer.name : ''}'s turn</p>
                            {turnEndTime && (
                                <Timer 
                                    duration={(turnEndTime - Date.now()) / 1000} // Convert to seconds
                                    onTimeout={() => {
                                        // The server will handle the timeout
                                    }}
                                />
                            )}
                            {room.gameSession.players.map(player => player && (
                                <p key={player._id}>{player.name} {player._id === room.creator && '(Host)'}</p>
                            ))}
                            {(turnPlayer && User._id === turnPlayer._id) && <button onClick={handleMakeMove}>Make Move</button>}
                            {User._id === room.creator && <button onClick={handleEndGame}>End Game</button>}
                        </div>
                    ) : (
                        <div>
                            <h2>Waiting for players to join... ({usersWaiting.length} in room)</h2>
                            {usersWaiting.map(user => (
                                <p key={user._id}>{user.name} {user._id === room.creator && '(Host)'}</p>
                            ))}
                            {User._id === room.creator && <button onClick={handleStartGame} disabled={usersWaiting.length < 2}>Start Game</button>}
                        </div>
                    )}
                </>
            ) : (
                <p>Loading room data...</p>
            )}
        </div>
    );
}

export default RoomPage;
