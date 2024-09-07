import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import accountService from "../services/account.service";
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { useNotifications } from '@toolpad/core/useNotifications';

function RoomPage() {
    const [room, setRoom] = useState(null)
    const { roomId } = useParams();
    const [usersWaiting, setUsersWaiting] = useState([])
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const notifications = useNotifications();

    useEffect(() => {
        async function init() {
            try {
                const room = await accountService.getRoom(roomId)
                setRoom(room)
            } catch (error) {
                const errorDescription = error.response.data.message;
                alert(errorDescription);
            }
        }
        init()
        socket.emit('joinRoom', roomId);

        // Listen for the initial list of players
        socket.on('currentUsers', (users) => {
            setUsersWaiting(users);
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

        // Clean up listeners on component unmount
        return () => {
            socket.off('currentUsers');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('roomUpdated');
        };
    }, [roomId, socket])

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
            socket.emit('updateRoom', roomId, updatedRoom, [...usersWaiting])
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
            socket.emit('updateRoom', roomId, updatedRoom, [])
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
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
                            <h2>Game is active</h2>
                            {room.gameSession.players.map(player => (
                                <p key={player._id}>{player.name} {player._id === room.creator && '(Host)'}</p>
                            ))}
                            {User._id === room.creator && <button onClick={handleEndGame}>End Game</button>}
                        </div>
                    ) : (
                        <div>
                            <h2>Waiting for players to join... ({usersWaiting.length} in room)</h2>
                            {usersWaiting.map(user => (
                                <p key={user._id}>{user.name} {user._id === room.creator && '(Host)'}</p>
                            ))}
                            {User._id === room.creator && <button onClick={handleStartGame}>Start Game</button>}
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
