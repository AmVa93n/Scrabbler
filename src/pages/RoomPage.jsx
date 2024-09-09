import { useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import TurnAlertModal from '../components/TurnAlertModal';
import { Grid, Paper, Box, Typography } from '@mui/material';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/ChatInput';

function RoomPage() {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { roomId, room, usersWaiting, turnPlayer, isModalOpen, setIsModalOpen, modalMessage } = useContext(RoomContext)

    function handleStartGame() { 
        const gameSession = {players: [...usersWaiting]}
        socket.emit('startGame', roomId, gameSession)
    }

    function handleEndGame() {
        socket.emit('endGame', roomId)
    }

    function handleMakeMove() {
        const moveData = {}
        socket.emit('makeMove', roomId, moveData)
    }

    return (
        <>
        {room ? (
            <Grid container spacing={2} style={{ padding: '10px' }}>
                {/* Left Panel - Player List & Turn Data */}
                <Grid item xs={3}>
                    <Paper style={{ height: '81vh', padding: '20px' }}>
                        <Typography variant="h5">{room.gameSession ? 'Players' : `Waiting for players to join... (${usersWaiting.length} in room)`}</Typography>
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
                        
                            {/* Chat messages here */}
                            <RoomChat />

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
