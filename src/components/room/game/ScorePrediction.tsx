import { Box, Typography } from '@mui/material';

interface Props {
    wordsWithScores: {word: string, score: number}[]
}

function ScorePrediction({ wordsWithScores }: Props) {
    const totalScore = wordsWithScores.reduce((sum, w) => sum + w.score, 0);

    return (
        <Box sx= {{
            mt: 1, 
            width: '95%', p: 1,
            boxSizing: 'border-box', 
            borderRadius: 1, 
            bgcolor: 'rgba(0, 0, 0, 0.1)'
        }}>
            {totalScore > 0 && <>
                {wordsWithScores.map(entry => (
                    <Box key={entry.word} sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography variant='body2'>{entry.word}</Typography>
                        <Typography variant='body2'>{entry.score}</Typography>
                    </Box>
                ))}
                <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                    <Typography variant='body2' sx={{fontWeight: 'bold'}}>Total</Typography>
                    <Typography variant='body2' sx={{fontWeight: 'bold'}}>{totalScore}</Typography>
                </Box>
            </>}
        </Box>
    );
}

export default ScorePrediction;