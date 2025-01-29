import { createContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from "../hooks/useSocket";
import accountService from "../services/account.service";
import { User, Room } from '../types';
import useAuth from '../hooks/useAuth';

const RoomContext = createContext({} as Context);

interface Context {
    usersInRoom: User[],
    room: Room | null,
    setRoom: React.Dispatch<React.SetStateAction<Room | null>>,
}

function RoomProvider(props: { children: React.ReactNode }) {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [usersInRoom, setUsersInRoom] = useState([] as User[]);
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            try { // Get DB room data when user joins
                const room = await accountService.getRoom(roomId || '')
                const { kickedUsers } = room
                if (kickedUsers.includes(user?._id)) { // redirect to home if user was kicked before
                    navigate('/')
                    return
                }
                setRoom(room)
                socket?.emit('joinRoom', roomId);
            } catch (error) {
                console.error(error)
                alert('Error joining room')
            }
        }
        init()

        if (!socket) return;

        // Get non-DB room data when user joins (private)
        socket.on('refreshRoom', (usersInRoom) => {
            setUsersInRoom(usersInRoom);
        });

        // Listen for users joining the room (public)
        socket.on('userJoined', (user) => {
            setUsersInRoom(prevUsers => prevUsers.some(u => u._id === user._id) ? prevUsers : [...prevUsers, user]);
        });

        // Listen for users leaving the room (public)
        socket.on('userLeft', (user) => {
            setUsersInRoom((prevUsers) => prevUsers.filter(u => u._id !== user._id));
        });

        // Listen for when a user is kicked (private)
        socket.on('userKicked', () => {
            socket.emit('leaveRoom', 'kicked');
            navigate('/')
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshRoom');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('userKicked');
        };
    }, [roomId, socket, user?._id]);

    return (
        <RoomContext.Provider value={{
            usersInRoom,
            room,
            setRoom,
        }}>
            {props.children}
        </RoomContext.Provider>
    );
};

export { RoomProvider, RoomContext };