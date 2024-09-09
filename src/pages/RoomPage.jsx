import { useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { GameProvider } from '../context/game.context';
import TurnAlertModal from '../components/TurnAlertModal';
import { Grid2, Paper, Box, Typography } from '@mui/material';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/ChatInput';
import Board from '../components/Board';
import LetterBank from '../components/LetterBank';
import Button from '@mui/material/Button';

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
            <Grid2 container columnSpacing={2} columns={3} sx={{ padding: '10px', height: '87vh' }}>
                {/* Left Panel - Player List & Turn Data */}
                <Grid2 item sx={{ width: '22%', height: '100%'}}>
                    <Paper style={{ padding: '10px', height: '100%' }}>
                        <Typography variant="h5">{room.gameSession ? 'Players' : `Waiting for players to join... (${usersWaiting.length} in room)`}</Typography>
                        <Box>
                            <UserList />
                        </Box>
                    </Paper>
                </Grid2>

                {/* Middle Panel - Game Board */}
                <Grid2 item sx={{ width: '50%', height: '100%' }}>
                    <Paper sx={{ padding: '10px', height: '100%',
                    }}>
                        <TurnAlertModal isOpen={isModalOpen} message={modalMessage} onClose={() => setIsModalOpen(false)} />
                        {/* Game Board goes here */}
                        {room.gameSession ? (
                            <GameProvider>
                                <LetterBank />
                                <Board />
                                {(turnPlayer && User._id === turnPlayer._id) && <Button 
                                    variant="contained" 
                                    color="primary" 
                                    sx= {{position: 'absolute'}}
                                    onClick={handleMakeMove}>
                                        Make Move
                                </Button>}
                                {(User._id === room.creator) && <Button 
                                    variant="contained" 
                                    color="error" 
                                    sx= {{position: 'absolute'}}
                                    onClick={handleEndGame}>
                                        End Game
                                </Button>}
                            </GameProvider>
                        ) : (
                            User._id === room.creator && 
                            <Box sx={{
                                width: '100%', 
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    onClick={handleStartGame} 
                                    disabled={usersWaiting.length < 1}>
                                        Start Game
                                </Button>
                            </Box>
                        )} 
                    </Paper>
                </Grid2>

                {/* Right Panel - Live Chat */}
                <Grid2 item sx={{ width: '25%', height: '100%'}}>
                    <Paper style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5">Room Chat</Typography>
                            <RoomChat />
                        <Box>
                            <ChatInput />
                        </Box>
                    </Paper>
                </Grid2>
            </Grid2>
    ) : (
        <Loading />
    )}
    </>
    );
}

export default RoomPage;
