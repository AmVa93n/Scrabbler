import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import accountService from "../services/account.service";
import { useSocket } from '../context/socket.context';

function RoomPage() {
    const [room, setRoom] = useState(null)
    const { roomId } = useParams();
    const [players, setPlayers] = useState([])
    const socket = useSocket();

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
            setPlayers(users);
        });

        // Listen for players joining the room
        socket.on('userJoined', (user) => {
            // Check if the user is already in the players array by comparing IDs
            setPlayers((prevPlayers) => {
                const isUserAlreadyIn = prevPlayers.some(player => player._id === user._id);
                if (isUserAlreadyIn) return prevPlayers;  // Return previous players if already in the list
                return [...prevPlayers, user];  // Add the new user if not already present
            });
        });

        // Listen for players leaving the room
        socket.on('userLeft', (user) => {
            setPlayers((prevPlayers) => prevPlayers.filter(player => player._id !== user._id));
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('currentUsers');
            socket.off('userJoined');
            socket.off('userLeft');

        };
    }, [roomId, socket])

    return (
        <>
            <p>{room ? room._id : ''}</p>
            {players.map(player => (
                <p key={player._id}>{player.name}</p>
            ))}
        </>
    );
}

export default RoomPage;
