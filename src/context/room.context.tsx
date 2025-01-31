import { createContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from "../hooks/useSocket";
import accountService from "../services/account.service";
import { User, Room, Board, TileBag } from '../types';
import useAuth from '../hooks/useAuth';

const RoomContext = createContext({} as Context);

interface Context {
    usersInRoom: User[],
    room: Room | null,
    setRoom: React.Dispatch<React.SetStateAction<Room | null>>,
    boards: Board[],
    tileBags: TileBag[],
}

function RoomProvider(props: { children: React.ReactNode }) {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [usersInRoom, setUsersInRoom] = useState([] as User[]);
    const [boards, setBoards] = useState([] as Board[])
    const [tileBags, setTileBags] = useState([] as TileBag[])
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRoom() {
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

        async function fetchResources() {
            try {
              const boards = await accountService.getBoards()
              setBoards(boards)
              const tileBags = await accountService.getTileBags()
              setTileBags(tileBags)
            } catch (error) {
              console.error(error)
              alert('An error occurred. Please refresh the page and try again')
            }
        }

        fetchRoom()
        if (user?._id === room?.creator) fetchResources() // fetch resources only if user is the room creator
    }, [roomId, socket, user?._id, room?.creator]);

    useEffect(() => {
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
    }, [socket]);

    return (
        <RoomContext.Provider value={{
            usersInRoom, room, setRoom, boards, tileBags
        }}>
            {props.children}
        </RoomContext.Provider>
    );
};

export { RoomProvider, RoomContext };