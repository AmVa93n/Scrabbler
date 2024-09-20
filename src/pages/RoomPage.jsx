import { useContext, useState } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import AlertModal from '../components/AlertModal';
import LetterSelectionModal from '../components/LetterSelectionModal';
import LetterReplaceModal from '../components/ReplaceLettersModal';
import PromptModal from '../components/PromptModal';
import GameSettings from '../components/GameSettings';
import { Grid2, Paper, Box, Typography } from '@mui/material';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import Loading from '../components/Loading/Loading';
import ChatInput from '../components/ChatInput';
import Board from '../components/Board';
import LetterBank from '../components/LetterBank';
import Button from '@mui/material/Button';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoopIcon from '@mui/icons-material/Loop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import TerminalIcon from '@mui/icons-material/Terminal';

function RoomPage() {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { roomId, isRoomLoaded, usersInRoom, isActive, hostId } = useContext(RoomContext)
    const { turnPlayer, placedLetters, board, leftInBag, setIsLReplaceOpen, canClick, setCanClick, 
        setIsPromptOpen } = useContext(GameContext)
    const [promptData, setPromptData] = useState(null)

    function handleEndGame() {
        socket.emit('endGame', roomId)
    }

    function handleSubmit() {
        let currentPromptData = promptData;
        if (!promptData) { // set to default in case player did not specify
            const word = getWordForPrompt()
            if (word) {
                const defaultText = `${turnPlayer.name} was thinking about ${word.toLowerCase()} because`
                currentPromptData = {promptText: defaultText, targetReaction: 'funny'};
                setPromptData(currentPromptData)
            }
        }
        const wordsWithScores = extractWordsFromBoard(placedLetters, board)
        socket.emit('validateMove', roomId, placedLetters, board, wordsWithScores, currentPromptData)
        setCanClick(false)
        setPromptData(null)
    }

    function handleSwapOrPass() {
        if (leftInBag > 0) setIsLReplaceOpen(true)
        else {
            socket.emit('passTurn', roomId)
            setCanClick(false)
        }
    }

    function handlePrompt() {
        setIsPromptOpen(true)
    }

    function isLetterPlacementValid() {
        // If there's only one letter placed and it's the only letter on the board
        const allLettersOnBoard = board.flat().filter(tile => tile.occupied);
        const isFirstWord = placedLetters.length === allLettersOnBoard.length
        if (isFirstWord) {
            if (placedLetters.length === 1) return false; // Only one letter on the board for the first word
            const center = board.length / 2 -0.5
            if (!placedLetters.some(letter => letter.x === center && letter.y === center)) return false // First word must touch center
        }

        const firstPlacedLetter = placedLetters[0];
        const isSameRow = placedLetters.every(letter => letter.y === firstPlacedLetter.y);
        const isSameColumn = placedLetters.every(letter => letter.x === firstPlacedLetter.x);
        if (!isSameRow && !isSameColumn) return false;

        // Check if any of the new letters connects to existing letters
        if (!isFirstWord) {
            const existingLetters = new Set(
                board.flat().filter(tile => tile.fixed).map(tile => `${tile.x},${tile.y}`)
            );
            
            const anyNewLettersConnected = placedLetters.some(letter => {
                // Check if the letter is adjacent to an existing letter
                const adjacentPositions = [
                    { x: letter.x - 1, y: letter.y }, // left
                    { x: letter.x + 1, y: letter.y }, // right
                    { x: letter.x, y: letter.y - 1 }, // up
                    { x: letter.x, y: letter.y + 1 }, // down
                ];
                return adjacentPositions.some(pos => existingLetters.has(`${pos.x},${pos.y}`));
            });

            if (!anyNewLettersConnected) return false;
        }
      
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

    function getScorePrediction() {
        const wordsWithScores = extractWordsFromBoard(placedLetters, board)
        const wordScoreList = wordsWithScores.map(w => `${w.word} (${w.score})`).join('\n');
        const totalScore = wordsWithScores.reduce((sum, w) => sum + w.score, 0);
        if (totalScore > 0 && isLetterPlacementValid()) {
            return (
                <Box sx= {{mx: 'auto', mt: 1, alignSelf: 'center'}}>
                    <Typography variant='body2' sx={{whiteSpace: 'pre-line'}}>{wordScoreList}</Typography>
                    <Typography variant='body2' sx={{fontWeight: 'bold'}}>Total: {totalScore}</Typography>
                </Box>
            );
        }
        return '';
    }

    function extractWordsFromBoard(newlyPlacedLetters, updatedBoard) {
        const wordsWithScores = [];
        
        // Helper function to check if a word contains a new letter
        function letterPlacedThisTurn(tileSeq) {
          const newlyPlacedLetterIds = newlyPlacedLetters.map(letter => letter.id);
          return tileSeq.some(tile => tile.content && newlyPlacedLetterIds.includes(tile.content.id));
        }
        
        // Horizontal words
        for (let row = 0; row < updatedBoard.length; row++) {
          let tileSeq = [];
          for (let col = 0; col < updatedBoard[row].length; col++) {
            const tile = updatedBoard[row][col];
            if (tile.content) {
              tileSeq.push(tile); // Collect the tiles that form a word
            } else {
              if (tileSeq.length > 1 && letterPlacedThisTurn(tileSeq)) {
                const word = tileSeq.map(tile => tile.content.letter).join('');
                const score = calculateWordScore(tileSeq);
                wordsWithScores.push({ word, score });
              }
              tileSeq = []; // Reset
            }
          }
          if (tileSeq.length > 1 && letterPlacedThisTurn(tileSeq)) {
            const word = tileSeq.map(tile => tile.content.letter).join('');
            const score = calculateWordScore(tileSeq);
            wordsWithScores.push({ word, score });
          }
        }
      
        // Vertical words
        for (let col = 0; col < updatedBoard[0].length; col++) {
          let tileSeq = [];
          for (let row = 0; row < updatedBoard.length; row++) {
            const tile = updatedBoard[row][col];
            if (tile.content) {
              tileSeq.push(tile); // Collect the tiles that form a word
            } else {
              if (tileSeq.length > 1 && letterPlacedThisTurn(tileSeq)) {
                const word = tileSeq.map(tile => tile.content.letter).join('');
                const score = calculateWordScore(tileSeq);
                wordsWithScores.push({ word, score });
              }
              tileSeq = []; // Reset
            }
          }
          if (tileSeq.length > 1 && letterPlacedThisTurn(tileSeq)) {
            const word = tileSeq.map(tile => tile.content.letter).join('');
            const score = calculateWordScore(tileSeq);
            wordsWithScores.push({ word, score });
          }
        }
        
        return wordsWithScores;
    }

    function calculateWordScore(tileSeq) {
        let wordScore = 0;
        let wordMultiplier = 1;
  
        tileSeq.forEach(tile => {
          const letterScore = tile.content.points;
          
          // Check if this tile was placed during this turn
          if (!tile.fixed) {
            // Apply the bonus based on tile.bonusType
            switch(tile.bonusType) {
                case 'doubleLetter': wordScore += letterScore * 2; break
                case 'tripleLetter': wordScore += letterScore * 3; break
                case 'quadrupleLetter': wordScore += letterScore * 4; break
                case 'doubleWord': 
                    wordScore += letterScore;
                    wordMultiplier *= 2; break // Double the entire word score
                case 'tripleWord':
                    wordScore += letterScore;
                    wordMultiplier *= 3; break // Triple the entire word score
                case 'quadrupleWord':
                    wordScore += letterScore;
                    wordMultiplier *= 4; break // x4 the entire word score
                default: wordScore += letterScore; // No bonus, just add the letter score
            }
          } else {
            // No bonus for pre-existing letters, just add the letter score
            wordScore += letterScore;
          }
        });
  
        // Apply the word multiplier (if any)
        return wordScore * wordMultiplier;
    }

    function getWordForPrompt() {
        const wordsWithScores = extractWordsFromBoard(placedLetters, board)
        const words = wordsWithScores.map(w => w.word)
        return words.find(w => w.length > 2)
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
                    height: '625px', 
                    boxSizing: 'border-box',
                }}>
                {/* Left Panel - Player List & Turn Data */}
                <Grid2 item size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
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
                                sx= {{mx: 'auto', mt: 'auto', alignSelf: 'center', textTransform: 'none'}}
                                onClick={handleEndGame}
                                >
                                    End Game
                            </Button>}
                    </Paper>
                </Grid2>

                {/* Middle Panel - Game Board */}
                <AlertModal />
                <LetterSelectionModal />
                <LetterReplaceModal />
                <PromptModal word={board && getWordForPrompt()} promptData={promptData} setPromptData={setPromptData} />
                <Grid2 item size={2} sx={{ height: '100%', boxSizing: 'border-box' }}>
                    <Paper sx={{ padding: '10px', height: '97%', display: 'flex'}}>
                        {isActive ? (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1}}>
                                    <Box sx={{display: 'flex'}}>
                                        <Box sx={{
                                            backgroundImage: `url('/letterbag.png')`, 
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
                                        <LetterBank />
                                    </Box>
                                    {board && getScorePrediction()}
                                    {(turnPlayer && User._id === turnPlayer._id) && 
                                    <>
                                        <Button 
                                            variant="contained" 
                                            color="info" 
                                            sx= {{mx: 'auto', mt: 'auto', alignSelf: 'center', textTransform: 'none'}}
                                            startIcon={<TerminalIcon />}
                                            onClick={handlePrompt}
                                            disabled={!canClick || !getWordForPrompt()}
                                            >
                                            Prompt
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            sx= {{mx: 'auto', mt: 1, alignSelf: 'center', textTransform: 'none'}}
                                            startIcon={leftInBag > 0 ? <LoopIcon /> : <FastForwardIcon />}
                                            onClick={handleSwapOrPass}
                                            disabled={!canClick}
                                            >
                                            {leftInBag > 0 ? 'Swap' : 'Pass'}
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            sx= {{mx: 'auto', mt: 1, alignSelf: 'center', textTransform: 'none'}}
                                            startIcon={<CheckCircleIcon />}
                                            onClick={handleSubmit}
                                            disabled={!canClick || placedLetters.length === 0 || !isLetterPlacementValid()}
                                            >
                                            Submit
                                        </Button>
                                    </>}
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
                <Grid2 item size={1} sx={{ height: '100%', boxSizing: 'border-box'}}>
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
