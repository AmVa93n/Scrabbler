import { createContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from "../hooks/useSocket";
import accountService from "../services/account.service";
import { User, Message } from '../types';
import useAuth from '../hooks/useAuth';

const RoomContext = createContext({} as Context);

interface Context {
    usersInRoom: User[],
    roomId: string | undefined,
    roomName: string,
    messages: Message[],
    isActive: boolean,
    setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
    rackSize: number,
    setRackSize: React.Dispatch<React.SetStateAction<number>>,
    gameMode: string,
    setGameMode: React.Dispatch<React.SetStateAction<string>>,
    hostId: string,
    isRoomLoaded: boolean
}

function RoomProvider(props: { children: React.ReactNode }) {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const [hostId, setHostId] = useState('')
    const [roomName, setRoomName] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [rackSize, setRackSize] = useState(7)
    const [gameMode, setGameMode] = useState('')
    const [messages, setMessages] = useState([] as Message[])
    const [usersInRoom, setUsersInRoom] = useState([] as User[])
    const [isRoomLoaded, setIsRoomLoaded] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            try { // Get DB room data when user joins
                const roomData = await accountService.getRoom(roomId || '')
                const { kickedUsers, creator, messages, gameSession, name } = roomData
                if (kickedUsers.includes(user?._id)) { // redirect to home if user was kicked before
                    navigate('/')
                    return
                }
                setRoomName(name)
                setHostId(creator)
                setMessages(messages)
                setIsActive(!!gameSession)
                if (gameSession) {
                    setRackSize(gameSession.settings.rackSize)
                    setGameMode(gameSession.settings.gameEnd)
                } 
                setIsRoomLoaded(true)
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

        // Listen for new messages (public)
        socket.on('chatUpdated', (newMsg) => {
            setMessages(prevMessages => [...prevMessages, newMsg]);
        });

        // Listen for new reactions (public)
        socket.on('reactionsUpdated', (messageId, updatedReactions) => {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                  message._id === messageId ? {...message, reactions: updatedReactions} : message
                )
              );
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshRoom');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('userKicked');
            socket.off('chatUpdated');
            socket.off('reactionsUpdated');
        };
    }, [roomId, socket, user?._id]);

    return (
        <RoomContext.Provider value={{
            usersInRoom,
            roomId,
            roomName,
            messages,
            isActive, setIsActive,
            rackSize, setRackSize,
            gameMode, setGameMode,
            hostId,
            isRoomLoaded
        }}>
            {props.children}
        </RoomContext.Provider>
    );
};

export { RoomProvider, RoomContext };