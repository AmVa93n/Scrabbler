import { Box, Typography } from '@mui/material';
import Board from './Board';
import GameActions from './GameActions';
import Rack from './Rack';
import ScorePrediction from './ScorePrediction';
import useGame from '../../../hooks/useGame';
import useAuth from '../../../hooks/useAuth';
import useRoom from '../../../hooks/useRoom';
import { Square } from '../../../types';

function GameScreen() {
    const { user } = useAuth();
    const { room } = useRoom();
    const rackSize = room?.gameSession?.settings.rackSize || 7;
    const { leftInBag, players, rack, setRack, board, setBoard, tilesPlacedThisTurn, setTilesPlacedThisTurn, resetTurnActions } = useGame();
    const isPlaying = !!players.find(player => player._id === user?._id) // check if user is participating in the game

    function isTilePlacementValid() {
        if (!board) return false;
        // If there's only one letter placed and it's the only letter on the board
        const allLettersOnBoard = board.flat().filter(square => square.occupied);
        const isFirstWord = tilesPlacedThisTurn.length === allLettersOnBoard.length
        if (isFirstWord) {
            if (tilesPlacedThisTurn.length === 1) return false; // Only one letter on the board for the first word
            const center = board.length / 2 -0.5
            if (!tilesPlacedThisTurn.some(letter => letter.x === center && letter.y === center)) return false // First word must touch center
        }

        const firstPlacedLetter = tilesPlacedThisTurn[0];
        const isSameRow = tilesPlacedThisTurn.every(letter => letter.y === firstPlacedLetter.y);
        const isSameColumn = tilesPlacedThisTurn.every(letter => letter.x === firstPlacedLetter.x);
        if (!isSameRow && !isSameColumn) return false;

        // Check if any of the new letters connects to existing letters
        if (!isFirstWord) {
            const existingLetters = new Set(
                board.flat().filter(square => square.fixed).map(square => `${square.x},${square.y}`)
            );
            
            const anyNewLettersConnected = tilesPlacedThisTurn.some(letter => {
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
            tilesPlacedThisTurn.forEach(letter => {
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
                        letter: square.content!.letter,
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
            tilesPlacedThisTurn.forEach(letter => {
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
                        letter: square.content!.letter,
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

    function getWordsWithScores() {
        if (!board) return [];
        const wordsWithScores = [];
        
        // Helper function to check if a word contains a new letter
        function isNewWord(sequence: Square[]) {
          const newlyPlacedLetterIds = tilesPlacedThisTurn.map(letter => letter.id);
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
                const word = sequence.map(square => square.content!.letter).join('');
                const score = calculateWordScore(sequence);
                wordsWithScores.push({ word, score });
              }
              sequence = []; // Reset
            }
          }
          if (sequence.length > 1 && isNewWord(sequence)) {
            const word = sequence.map(square => square.content!.letter).join('');
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
                const word = sequence.map(square => square.content!.letter).join('');
                const score = calculateWordScore(sequence);
                wordsWithScores.push({ word, score });
              }
              sequence = []; // Reset
            }
          }
          if (sequence.length > 1 && isNewWord(sequence)) {
            const word = sequence.map(square => square.content!.letter).join('');
            const score = calculateWordScore(sequence);
            wordsWithScores.push({ word, score });
          }
        }
        
        return wordsWithScores;
    }

    function calculateWordScore(sequence: Square[]) {
        let wordScore = 0;
        let wordMultiplier = 1;
  
        sequence.forEach(square => {
          const letterScore = square.content!.points;
          
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

    return (
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
                    {isPlaying && 
                        <Rack 
                            tilesOnRack={rack} 
                            setTilesOnRack={setRack} 
                            setBoard={setBoard} 
                            setTilesPlacedThisTurn={setTilesPlacedThisTurn} 
                            rackSize={rackSize} 
                        />}
                </Box>
                {(isPlaying && isTilePlacementValid()) && <ScorePrediction wordsWithScores={getWordsWithScores()} />}
                {isPlaying && 
                    <GameActions 
                        tilesOnRack={rack}
                        tilesPlacedThisTurn={tilesPlacedThisTurn}
                        board={board} 
                        leftInBag={leftInBag}
                        resetTurnActions={resetTurnActions}
                        wordsWithScores={getWordsWithScores()}
                        isTilePlacementValid={isTilePlacementValid()}
                    />}
            </Box>
            <Board board={board} />
        </>
    );
}

export default GameScreen;