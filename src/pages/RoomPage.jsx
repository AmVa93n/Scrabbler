import { useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import AlertModal from '../components/AlertModal';
import LetterSelectionModal from '../components/LetterSelectionModal';
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
    const { roomId, isRoomLoaded, usersInRoom, isActive, hostId } = useContext(RoomContext)
    const { turnPlayer, placedLetters, board, leftInBag } = useContext(GameContext)

    function handleStartGame() { 
        const gameSession = {players: [...usersInRoom]}
        socket.emit('startGame', roomId, hostId, gameSession)
    }

    function handleEndGame() {
        socket.emit('endGame', roomId)
    }

    function handleValidateMove() {
        socket.emit('validateMove', roomId, placedLetters, board)
    }

    function isLetterPlacementValid() {
        const firstPlacedLetter = placedLetters[0];
        const isSameRow = placedLetters.every(letter => letter.y === firstPlacedLetter.y);
        const isSameColumn = placedLetters.every(letter => letter.x === firstPlacedLetter.x);
        if (!isSameRow && !isSameColumn) return false;
      
        // If all placed letters are in the same row
        if (isSameRow) {
            const row = firstPlacedLetter.y;
            let minX = Infinity;
            let maxX = -Infinity;
        
            // Determine the range of x-coordinates to check
            placedLetters.forEach(letter => {
            if (letter.y === row) {
                minX = Math.min(minX, letter.x);
                maxX = Math.max(maxX, letter.x);
            }
            });
        
            // Collect all relevant letters within the determined range
            const combinedLetters = [];
            for (let x = minX; x <= maxX; x++) {
                const tile = board[row][x];
                if (tile.occupied) {
                    combinedLetters.push({
                        letter: tile.content.letter,
                        x: x,
                        y: row,
                    });
                }
            }
        
            // Sort by x-coordinate and check continuity
            combinedLetters.sort((a, b) => a.x - b.x);
            for (let i = 1; i < combinedLetters.length; i++) {
                if (combinedLetters[i].x !== combinedLetters[i - 1].x + 1) {
                    return false; // Not continuous
                }
            }
            return true;
        }
      
        // If all placed letters are in the same column
        if (isSameColumn) {
            const col = firstPlacedLetter.x;
            let minY = Infinity;
            let maxY = -Infinity;
        
            // Determine the range of y-coordinates to check
            placedLetters.forEach(letter => {
            if (letter.x === col) {
                minY = Math.min(minY, letter.y);
                maxY = Math.max(maxY, letter.y);
            }
            });
        
            // Collect all relevant letters within the determined range
            const combinedLetters = [];
            for (let y = minY; y <= maxY; y++) {
                const tile = board[y][col];
                if (tile.occupied) {
                    combinedLetters.push({
                        letter: tile.content.letter,
                        x: col,
                        y: y,
                    });
                }
            }
        
            // Sort by y-coordinate and check continuity
            combinedLetters.sort((a, b) => a.y - b.y);
            for (let i = 1; i < combinedLetters.length; i++) {
                if (combinedLetters[i].y !== combinedLetters[i - 1].y + 1) {
                    return false; // Not continuous
                }
            }
            return true;
        }
      
        return false; // If letters are neither in a row nor a column
    }

    return (
        <>
        {isRoomLoaded ? (
            <Grid2 
                container 
                columnSpacing={2} 
                columns={4} 
                sx={{ 
                    padding: '10px', 
                    height: '90vh', 
                    backgroundColor: 'lightblue',
                    boxSizing: 'border-box',
                }}>
                {/* Left Panel - Player List & Turn Data */}
                <Grid2 item size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
                    <Paper sx={{ padding: '10px', height: '97%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="h5">{isActive ? 'Players' : `Waiting for players to join... (${usersInRoom.length} in room)`}</Typography>
                            <UserList />
                            {(User._id === hostId && isActive) && <Button 
                                    variant="contained" 
                                    color="error" 
                                    sx= {{mx: 'auto', mt: 'auto', alignSelf: 'center'}}
                                    onClick={handleEndGame}
                                    >
                                        End Game
                                </Button>}
                        </Box>
                    </Paper>
                </Grid2>

                {/* Middle Panel - Game Board */}
                <AlertModal />
                <LetterSelectionModal />
                <Grid2 item size={2} sx={{ height: '100%', boxSizing: 'border-box' }}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex'}}>
                        {isActive ? (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1}}>
                                    <Typography variant="body2">Letter Bank</Typography>
                                    <LetterBank />
                                    <Typography variant="body2">{leftInBag} Letters left in the bag</Typography>
                                    {(turnPlayer && User._id === turnPlayer._id) && 
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        sx= {{mx: 'auto', mt: 'auto', alignSelf: 'center'}}
                                        onClick={handleValidateMove}
                                        disabled={placedLetters.length === 0 || !isLetterPlacementValid()}
                                        >
                                        Submit
                                    </Button>}
                                </Box>
                                <Board />
                            </>
                        ) : (
                            User._id === hostId && 
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
                                    disabled={usersInRoom.length < 1}>
                                        Start Game
                                </Button>
                            </Box>
                        )} 
                    </Paper>
                </Grid2>

                {/* Right Panel - Live Chat */}
                <Grid2 item size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex', flexDirection: 'column' }}>
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
