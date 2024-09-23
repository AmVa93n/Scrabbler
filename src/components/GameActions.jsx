import { useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { Button, Stack, Typography, Box } from '@mui/material';
import LetterSelectionModal from './LetterSelectionModal';
import LetterReplaceModal from './ReplaceLettersModal';
import PromptModal from './PromptModal';
import AlertModal from '../components/AlertModal';
import InactiveModal from '../components/InactiveModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoopIcon from '@mui/icons-material/Loop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import TerminalIcon from '@mui/icons-material/Terminal';
import UndoIcon from '@mui/icons-material/Undo';

function GameActions() {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const { roomId, gameMode } = useContext(RoomContext)
    const { turnPlayer, placedLetters, board, leftInBag, setIsLReplaceOpen, canClick, setCanClick, setIsPromptOpen, promptData, 
        setPromptData, resetTurnActions } = useContext(GameContext)

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
        const wordsWithScores = getWordsWithScores()
        socket.emit('validateMove', roomId, placedLetters, board, wordsWithScores, currentPromptData)
        setCanClick(false)
        setPromptData(null)
    }

    function handleSwapOrPass() {
        if (leftInBag > 0) setIsLReplaceOpen(true)
        else {
            socket.emit('passTurn', roomId)
            setCanClick(false)
            resetTurnActions()
        }
    }

    function handleClear() {
        resetTurnActions()
    }

    function handlePrompt() {
        setIsPromptOpen(true)
    }

    function isLetterPlacementValid() {
        // If there's only one letter placed and it's the only letter on the board
        const allLettersOnBoard = board.flat().filter(square => square.occupied);
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
                board.flat().filter(square => square.fixed).map(square => `${square.x},${square.y}`)
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
                const square = board[row][x];
                if (square.occupied) {
                    combinedLetters.push({
                        letter: square.content.letter,
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
                const square = board[y][col];
                if (square.occupied) {
                    combinedLetters.push({
                        letter: square.content.letter,
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
        const wordsWithScores = getWordsWithScores()
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

    function getWordsWithScores() {
        const wordsWithScores = [];
        
        // Helper function to check if a word contains a new letter
        function isNewWord(sequence) {
          const newlyPlacedLetterIds = placedLetters.map(letter => letter.id);
          return sequence.some(square => square.content && newlyPlacedLetterIds.includes(square.content.id));
        }
        
        // Horizontal words
        for (let row = 0; row < board.length; row++) {
          let sequence = [];
          for (let col = 0; col < board[row].length; col++) {
            const square = board[row][col];
            if (square.content) {
              sequence.push(square); // Collect the squares that form a word
            } else {
              if (sequence.length > 1 && isNewWord(sequence)) {
                const word = sequence.map(square => square.content.letter).join('');
                const score = calculateWordScore(sequence);
                wordsWithScores.push({ word, score });
              }
              sequence = []; // Reset
            }
          }
          if (sequence.length > 1 && isNewWord(sequence)) {
            const word = sequence.map(square => square.content.letter).join('');
            const score = calculateWordScore(sequence);
            wordsWithScores.push({ word, score });
          }
        }
      
        // Vertical words
        for (let col = 0; col < board[0].length; col++) {
          let sequence = [];
          for (let row = 0; row < board.length; row++) {
            const square = board[row][col];
            if (square.content) {
              sequence.push(square); // Collect the squares that form a word
            } else {
              if (sequence.length > 1 && isNewWord(sequence)) {
                const word = sequence.map(square => square.content.letter).join('');
                const score = calculateWordScore(sequence);
                wordsWithScores.push({ word, score });
              }
              sequence = []; // Reset
            }
          }
          if (sequence.length > 1 && isNewWord(sequence)) {
            const word = sequence.map(square => square.content.letter).join('');
            const score = calculateWordScore(sequence);
            wordsWithScores.push({ word, score });
          }
        }
        
        return wordsWithScores;
    }

    function calculateWordScore(sequence) {
        let wordScore = 0;
        let wordMultiplier = 1;
  
        sequence.forEach(square => {
          const letterScore = square.content.points;
          
          // Check if a letter was placed on this square during this turn
          if (!square.fixed) {
            // Apply the bonus
            switch(square.bonusType) {
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
        const wordsWithScores = getWordsWithScores()
        const words = wordsWithScores.map(w => w.word)
        return words.find(w => w.length > 2)
    }

    function canSwap() {
        if (gameMode === 'classic') {
            return leftInBag >= 7
        } else {
            return leftInBag > 0
        }
    }

    return (
        <>
            {board && getScorePrediction()}
            {(turnPlayer && User._id === turnPlayer._id) &&
            <Stack sx={{mt: 'auto'}}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    sx= {{mx: 'auto', alignSelf: 'center', textTransform: 'none'}}
                    startIcon={<UndoIcon />}
                    onClick={handleClear}
                    disabled={!canClick || placedLetters.length === 0}
                    >
                    Clear
                </Button>

                <Button 
                    variant="contained" 
                    color="primary" 
                    sx= {{mx: 'auto', mt: 1, alignSelf: 'center', textTransform: 'none'}}
                    startIcon={canSwap() ? <LoopIcon /> : <FastForwardIcon />}
                    onClick={handleSwapOrPass}
                    disabled={!canClick}
                    >
                    {canSwap() ? 'Swap' : 'Pass'}
                </Button>

                <Button 
                    variant="contained" 
                    color="info" 
                    sx= {{mx: 'auto', mt: 1, alignSelf: 'center', textTransform: 'none'}}
                    startIcon={<TerminalIcon />}
                    onClick={handlePrompt}
                    disabled={!canClick || !getWordForPrompt()}
                    >
                    Prompt
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
            </Stack>
            }

            <LetterSelectionModal />
            <LetterReplaceModal />
            <PromptModal word={board && getWordForPrompt()} />
            <AlertModal />
            <InactiveModal />
        </>
    )
}

export default GameActions;