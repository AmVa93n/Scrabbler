import { useState } from 'react';
import useSocket from '../../../hooks/useSocket';
import { Button, Stack } from '@mui/material';
import SwapModal from './SwapModal';
import PromptModal from './PromptModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoopIcon from '@mui/icons-material/Loop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import TerminalIcon from '@mui/icons-material/Terminal';
import UndoIcon from '@mui/icons-material/Undo';
import useAuth from '../../../hooks/useAuth';
import { GameBoard, Tile, TileOnBoard } from '../../../types';
import useRoom from '../../../hooks/useRoom';
import useTurn from '../../../hooks/useTurn';
import useAntiSpam from '../../../hooks/useAntiSpam';

interface Props {
    tilesOnRack: Tile[],
    tilesPlacedThisTurn: TileOnBoard[],
    board: GameBoard | null,
    leftInBag: number,
    resetTurnActions: () => void
    wordsWithScores: {word: string, score: number}[]
    isTilePlacementValid: boolean
}

function GameActions({ tilesOnRack, tilesPlacedThisTurn, board, leftInBag, resetTurnActions, wordsWithScores, isTilePlacementValid }: Props) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { room } = useRoom();
    const { turnPlayer } = useTurn();
    const { canClick, setCanClick } = useAntiSpam();
    const [promptData, setPromptData] = useState<{promptText : string, targetReaction: string} | null>(null)
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);

    function handleSubmit() {
        socket?.emit('validateMove', room?._id, tilesPlacedThisTurn, board, wordsWithScores, promptData)
        setCanClick(false)
        setPromptData(null)
    }

    function handleSwapOrPass() {
        if (leftInBag > 0) setIsSwapOpen(true)
        else {
            socket?.emit('passTurn', room?._id)
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

    function getWordForPrompt() {
        const words = wordsWithScores.map(w => w.word)
        return words.find(w => w.length > 2)
    }

    function canSwap() {
        if (room?.gameSession?.settings.gameEnd === 'classic') {
            return leftInBag >= 7
        } else {
            return leftInBag > 0
        }
    }

    return (
        <>
            {( user?._id === turnPlayer?._id) &&
            <Stack sx={{mt: 'auto'}}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    sx= {{mx: 'auto', alignSelf: 'center', textTransform: 'none'}}
                    startIcon={<UndoIcon />}
                    onClick={handleClear}
                    disabled={!canClick || tilesPlacedThisTurn.length === 0}
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
                    disabled={!canClick || tilesPlacedThisTurn.length === 0 || !isTilePlacementValid}
                    >
                    Submit
                </Button>
            </Stack>
            }

            <SwapModal 
                open={isSwapOpen} 
                onClose={() => setIsSwapOpen(false)} 
                tiles={[...tilesOnRack, ...tilesPlacedThisTurn]} 
                leftInBag={leftInBag}
                resetTurnActions={resetTurnActions}
            />
            <PromptModal open={isPromptOpen} onClose={() => setIsPromptOpen(false)} setPromptData={setPromptData} word={getWordForPrompt()} />
        </>
    )
}

export default GameActions;