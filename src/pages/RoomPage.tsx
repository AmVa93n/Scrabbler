import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import GameSettings from '../components/room/game/GameSettings';
import { Grid2, Paper, Box, Typography, Button } from '@mui/material';
import RoomBar from '../components/room/RoomBar';
import UserList from '../components/room/UserList';
import RoomChat from '../components/room/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/room/ChatInput';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import useAuth from '../hooks/useAuth';
import InactiveModal from '../components/room/game/InactiveModal';
import AlertModal from '../components/room/game/AlertModal';
import useRoom from '../hooks/useRoom';
import { GameState } from '../types';
import GameScreen from '../components/room/game/GameScreen';

function RoomPage() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { room, usersInRoom } = useRoom();
    const isActive = room?.gameSession !== null;
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isInactiveOpen, setIsInactiveOpen] = useState(false);
    const autoClose = 2000
    
    function handleEndGame() {
        socket?.emit('endGame', room?._id)
    }

    useEffect(() => {
        if (!socket) return;
        let timer: number;

        const onTurnStart = (sessionData: GameState) => {
            if (sessionData.turnPlayer._id === user?._id) { // this is private
                setAlertMessage("It's your turn!");
                setIsAlertOpen(true);
            }
            timer = setTimeout(() => setIsAlertOpen(false), autoClose);
        }

        const onTimeout = (hasBecomeInactive: boolean) => {
            if (hasBecomeInactive) {
                setIsInactiveOpen(true)
            } else {
                setAlertMessage("Your turn has timed out!");
                setIsAlertOpen(true);
                timer = setTimeout(() => setIsAlertOpen(false), autoClose);
            }
        }

        const onReject = (invalidWords: string[]) => {
            setAlertMessage(`Some of your words are not valid: ${invalidWords.join(', ')}`);
            setIsAlertOpen(true);
            timer = setTimeout(() => setIsAlertOpen(false), autoClose);
        }
        
        socket.on('turnStarted', onTurnStart); // Listen for turn start (public)
        socket.on('turnTimedOut', onTimeout); // Listen for turn timeout (private)
        socket.on('moveRejected', onReject); // Listen for when a move was rejected (private)

        return () => { // Clean up listeners on component unmount
            socket.off('turnStarted', onTurnStart);
            socket.off('turnTimedOut', onTimeout);
            socket.off('moveRejected', onReject);
            clearTimeout(timer);
        };

    }, [socket, user?._id]);

    return (
        <>
        <RoomBar roomName={room?.name || ''} />
        {room ? (
            <Grid2 
                container 
                columnSpacing={2} 
                columns={4} 
                sx={{ 
                    padding: '10px', 
                    height: '625px', 
                    boxSizing: 'border-box',
                }}>
                {/* Left Panel - Player List & Turn Data */}
                
                <Grid2 size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{display: 'flex', mb: 'auto', alignItems: 'center', mx: 'auto'}}>
                            <PeopleAltIcon sx={{mr: 1}} />
                            <Typography variant="h5">{`${usersInRoom.length} Users in room`}</Typography>
                        </Box>
                        {isActive && <UserList type={'players'} />}
                        <UserList type={'spectators'} />
                        {(user?._id === room.creator && isActive) && <Button 
                                variant="contained" 
                                color="error" 
                                startIcon={<CancelIcon />}
                                sx= {{mx: 'auto', mt: 1, alignSelf: 'center', textTransform: 'none'}}
                                onClick={handleEndGame}
                                >
                                    End Game
                            </Button>}
                    </Paper>
                </Grid2>

                {/* Middle Panel - Game Board */}
                <Grid2 size={2} sx={{ height: '100%', boxSizing: 'border-box' }}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex'}}>
                        {isActive ? (
                            <GameScreen />
                        ) : (
                            user?._id === room.creator && 
                            <GameSettings />
                        )} 
                    </Paper>
                </Grid2>

                {/* Right Panel - Live Chat */}
                <Grid2 size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{display: 'flex', mb: 'auto', alignItems: 'center', mx: 'auto'}}>
                            <ChatIcon sx={{mr: 1}} />
                            <Typography variant="h5">Room Chat</Typography>
                        </Box>
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
    <AlertModal open={isAlertOpen} onClose={() => setIsAlertOpen(false)} message={alertMessage} />
    <InactiveModal open={isInactiveOpen} onClose={() => setIsInactiveOpen(false)} />
    </>
    );
}

export default RoomPage;
