import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { AuthContext } from "../context/auth.context";
import { useSocket } from '../context/socket.context';
import accountService from "../services/account.service";

const RoomContext = createContext();

function RoomProvider(props) {
    const { roomId } = useParams();
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const [room, setRoom] = useState(null)
    const [usersWaiting, setUsersWaiting] = useState([])
    const [turnPlayer, setTurnPlayer] = useState(null);
    const [turnEndTime, setTurnEndTime] = useState(null);
    const [turnNumber, setturnNumber] = useState(0);
    const [inactivePlayerIds, setInactivePlayerIds] = useState([]);
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
                setInactivePlayerIds(sessionData.inactivePlayerIds)
            }
        });

        // Listen for players joining the room
        socket.on('userJoined', (user) => {
            setUsersWaiting(prevUsers => prevUsers.some(u => u._id === user._id) ? prevUsers : [...prevUsers, user]);
        });

        // Listen for players leaving the room
        socket.on('userLeft', (user) => {
            setUsersWaiting((prevUsers) => prevUsers.filter(u => u._id !== user._id));
        });

        // Listen for room updates by the host
        socket.on('roomUpdated', (updatedRoom) => {
            setRoom(updatedRoom);
        });

        let timer;
        socket.on('turnStart', (sessionData) => {
            // Update UI to indicate it's the current player's turn
            setTurnPlayer(sessionData.turnPlayer);
            setTurnEndTime(new Date(sessionData.turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
            setturnNumber(sessionData.turnNumber)
            setInactivePlayerIds(sessionData.inactivePlayerIds)
            if (sessionData.turnPlayer._id === User._id) {
                setModalMessage("It's your turn!");
                setIsModalOpen(true);
            }
            // Auto-close the modal after 3 seconds
            timer = setTimeout(() => setIsModalOpen(false), 3000);
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
            timer = setTimeout(() => setIsModalOpen(false), 3000);
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
            clearTimeout(timer);
        };
    }, [roomId, socket, User._id]);

    return (
        <RoomContext.Provider value={{
            room,
            setRoom,
            usersWaiting,
            turnPlayer,
            turnEndTime,
            turnNumber,
            isModalOpen,
            setIsModalOpen,
            modalMessage,
            roomId,
            inactivePlayerIds,
        }}>
            {props.children}
        </RoomContext.Provider>
    );
};

export { RoomProvider, RoomContext };