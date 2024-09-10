import Letter from '../components/Letter';
import { Paper } from '@mui/material';
import { GameContext } from '../context/game.context';
import { useContext } from 'react';

function LetterBank() {
    const { bank, bankSize } = useContext(GameContext)
  
    return (
        <>
        {bank && (
        <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '5px', 
            padding: '5px', 
            bgcolor: 'grey', 
            width: 35,
            height: ((35 * bankSize) + (5 * bankSize-1)),
            position: 'absolute',
            }}>
                {bank.map((letter) => (
                    <Letter 
                        key={letter.id} 
                        id={letter.id} 
                        letter={letter.letter} 
                        placed={letter.placed} 
                    />
                ))}
        </Paper>
        )}
        </>
    );
}

export default LetterBank;