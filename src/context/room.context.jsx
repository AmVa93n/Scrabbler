import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from "../context/auth.context";
import { useSocket } from '../context/socket.context';
import accountService from "../services/account.service";

const RoomContext = createContext();

function RoomProvider(props) {
    const { roomId } = useParams();
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const [hostId, setHostId] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [players, setPlayers] = useState([])
    const [messages, setMessages] = useState([])
    const [usersInRoom, setUsersInRoom] = useState([])
    const [banList, setBanList] = useState([])
    const [isRoomLoaded, setIsRoomLoaded] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            try { // Get DB room data when user joins
                const roomData = await accountService.getRoom(roomId)
                const { kickedUsers, creator, messages, gameSession } = roomData
                setBanList(kickedUsers)
                if (banList.includes(User._id)) { // redirect to home if user was kicked before
                    navigate('/')
                    return
                }
                setHostId(creator)
                setMessages(messages)
                setIsActive(!!gameSession)
                if (gameSession) setPlayers(gameSession.players)
                setIsRoomLoaded(true)
                socket.emit('joinRoom', roomId);
            } catch (error) {
                const errorDescription = error.response.data.message;
                alert(errorDescription);
            }
        }
        init()

        // Get non-DB room data when user joins (private)
        socket.on('refreshRoom', (usersInRoom) => {
            setUsersInRoom(usersInRoom);
        });

        // Listen for players joining the room (public)
        socket.on('userJoined', (user) => {
            setUsersInRoom(prevUsers => prevUsers.some(u => u._id === user._id) ? prevUsers : [...prevUsers, user]);
        });

        // Listen for players leaving the room (public)
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

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshRoom');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('chatUpdated');
            socket.off('userKicked');
        };
    }, [roomId, socket, User._id]);

    return (
        <RoomContext.Provider value={{
            usersInRoom,
            roomId,
            messages,
            isActive,
            setIsActive,
            players,
            setPlayers,
            hostId,
            isRoomLoaded
        }}>
            {props.children}
        </RoomContext.Provider>
    );
};

export { RoomProvider, RoomContext };