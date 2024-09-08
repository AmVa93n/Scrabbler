import { useContext } from 'react';
import accountService from "../services/account.service";
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { useNotifications } from '@toolpad/core/useNotifications';
import TurnAlertModal from '../components/TurnAlertModal';
import { Grid, Paper, Box, Typography } from '@mui/material';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/ChatInput';

function RoomPage() {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { roomId, room, setRoom, usersWaiting, turnPlayer, turnNumber, 
            isModalOpen, setIsModalOpen, modalMessage } = useContext(RoomContext)
    const notifications = useNotifications();

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
/*
    return (
        <div>
            {room ? (
                <>
                    <h1>{room.name}</h1>
                    {room.gameSession ? (
                        <div>
                            
                            <h2>Game is active</h2>
                            <p>Turn {turnNumber}</p>
                            <p>it is {turnPlayer ? turnPlayer.name : ''}'s turn</p>
                            
                            {room.gameSession.players.map(player => player && (
                                <p key={player._id}>{player.name} {player._id === room.creator && '(Host)'}</p>
                            ))}
                            
                        </div>
                    ) : (
                        <div>
                            <h2>Waiting for players to join... ({usersWaiting.length} in room)</h2>
                            {usersWaiting.map(user => (
                                <p key={user._id}>{user.name} {user._id === room.creator && '(Host)'}</p>
                            ))}
                            
                        </div>
                    )}
                </>
            ) : (
                <p>Loading room data...</p>
            )}
        </div>
    );
*/
    return (
        <>
        {room ? (
            <Grid container spacing={2} style={{ padding: '10px' }}>
                {/* Left Panel - Player List & Turn Data */}
                <Grid item xs={3}>
                    <Paper style={{ height: '81vh', padding: '20px' }}>
                        <Typography variant="h5">Players</Typography>
                        {/* List of Players */}
                        <Box>
                            <UserList />
                        </Box>
                    </Paper>
                </Grid>

                {/* Middle Panel - Game Board */}
                <Grid item xs={6}>
                    <Paper style={{ height: '81vh', padding: '20px' }}>
                        <TurnAlertModal isOpen={isModalOpen} message={modalMessage} onClose={() => setIsModalOpen(false)} />
                        {/* Game Board goes here */}
                        {room.gameSession ? (
                            <>
                            {(turnPlayer && User._id === turnPlayer._id) && <button onClick={handleMakeMove}>Make Move</button>}
                            {(User._id === room.creator) && <button onClick={handleEndGame}>End Game</button>}
                            </>
                        ) : (
                            User._id === room.creator && <button onClick={handleStartGame} disabled={usersWaiting.length < 2}>Start Game</button>
                        )}
                    </Paper>
                </Grid>

                {/* Right Panel - Live Chat */}
                <Grid item xs={3}>
                    <Paper style={{ height: '81vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5">Live Chat</Typography>
                        <Box style={{ flex: 1, overflowY: 'scroll' }}>
                            {/* Chat messages here */}
                            <RoomChat />
                        </Box>
                        <Box>
                            {/* Chat input field */}
                            <ChatInput />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
    ) : (
        <Loading />
    )}
    </>
    );
}

export default RoomPage;
