import { useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import GameSettings from '../components/GameSettings';
import GameActions from '../components/GameActions';
import { Grid2, Paper, Box, Typography, Button } from '@mui/material';
import RoomBar from '../components/RoomBar';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/ChatInput';
import Board from '../components/Board';
import Rack from '../components/Rack';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CancelIcon from '@mui/icons-material/Cancel';

function RoomPage() {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { roomId, isRoomLoaded, usersInRoom, isActive, hostId } = useContext(RoomContext)
    const { leftInBag } = useContext(GameContext)
    
    function handleEndGame() {
        socket.emit('endGame', roomId)
    }

    return (
        <>
        <RoomBar />
        {isRoomLoaded ? (
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
                            <Typography variant="h5">{isActive ? 'Players' : `${usersInRoom.length} Users in room`}</Typography>
                        </Box>
                        <UserList />
                        {(User._id === hostId && isActive) && <Button 
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
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1}}>
                                    <Box sx={{display: 'flex'}}>
                                        <Box sx={{
                                            backgroundImage: `url('/tilebag.png')`, 
                                            backgroundSize: '100%', 
                                            backgroundRepeat: 'no-repeat',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '50%',
                                            minWidth: 60,
                                            height: '31%',
                                            mr: 1
                                            }}>
                                            <Typography color='beige' variant="h6" sx={{mt: 2}}>{leftInBag}</Typography>
                                        </Box>
                                        <Rack />
                                    </Box>
                                    <GameActions />
                                </Box>
                                <Board />
                            </>
                        ) : (
                            User._id === hostId && 
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
    </>
    );
}

export default RoomPage;
