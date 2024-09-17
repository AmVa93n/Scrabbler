import { useSocket } from '../context/socket.context';
import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { Button, Select, MenuItem, Typography, Box, Grid2, Paper, TextField } from '@mui/material';
import NumberInput from '../components/NumberInput';
import SaveIcon from '@mui/icons-material/Save';

function LetterBagEditorPage() {
    const socket = useSocket();
    const [letterBags, setLetterBags] = useState([])
    const [currentBag, setCurrentBag] = useState({})

    useEffect(() => {
        if (socket) socket.emit('leaveRoom', 'left');

        async function init() {
            try {
            const letterBags = await accountService.getLetterBags()
            setLetterBags(letterBags)
            } catch (error) {
            const errorDescription = error.response.data.message;
            alert(errorDescription,'error',5000)
            }
        }
        init()
    }, [socket]);

    function handleChangeBag(e) {
        const selectedBag = letterBags.find(bag => bag._id === e.target.value)
        setCurrentBag(selectedBag)
    };

    function handleChange(e) {
        setCurrentBag(prev => ({...prev, name: e.target.value}))
    };

    function handleNumberInputChange(index, key, value) {
        setCurrentBag((prevBag) => {
            const updatedLetterData = [...prevBag.letterData];
            updatedLetterData[index] = {...updatedLetterData[index], [key]: value,};
            return { ...prevBag, letterData: updatedLetterData };
        });
    };

    function createThreeColumns(acc, curr, index) {
        index < 9 ? acc[0].push({ ...curr, originalIndex: index }) 
        : index < 18 ? acc[1].push({ ...curr, originalIndex: index })
        : acc[2].push({ ...curr, originalIndex: index })
        return acc;
    }

    function sortAlphabetically(a, b) {
        if (a.letter === '') return 1; // Move blank tile to the end
        if (b.letter === '') return -1; 
        return a.letter.localeCompare(b.letter); // Standard alphabetical sorting
    }

    return (
    <>
        <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', mt: 2}}>
            <FontDownloadIcon sx={{mr: 1}} />
            <Typography variant="h5">Letter Bag Editor</Typography>
        </Box>

        <Paper sx={{p: 2, width: 'fit-content', mx: 'auto', my: 2}}>
            <Select
                sx={{ width: 200, mx: 'auto', mb: 2, display: 'block' }} size="small"
                value={currentBag?._id || ''}
                onChange={handleChangeBag}
                >
                {letterBags.map(letterBag => (
                    <MenuItem key={letterBag._id} value={letterBag._id}>{letterBag.name}</MenuItem>
                ))}
            </Select>
            
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '50%', justifyContent: 'space-between'}}>
                <TextField label="Name" size="small" value={currentBag?.name || ''} onChange={handleChange}/>
                <Typography variant="body2" sx={{fontSize: 16}}>
                    Total Letters: {currentBag?.letterData?.reduce((acc, letter) => acc + letter.count, 0)}
                </Typography>
            </Box>

        <Grid2 container spacing={4}>
            {/* Split sorted array into two parts */}
            {currentBag?.letterData?.sort(sortAlphabetically)
            ?.reduce(createThreeColumns, [[], [], []]) // Initial accumulator with two empty arrays
            .map((columnData, columnIndex) => (
                <Grid2 item size={4} key={columnIndex}>

                    {/* Header Row */}
                    <Grid2 container item spacing={2}>
                        <Grid2 item size={4}>
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                Letter
                            </Typography>
                        </Grid2>
                        <Grid2 item size={4}>
                            <Typography variant="body2" sx={{ textAlign: 'center', minWidth: 105 }}>
                                Count
                            </Typography>
                        </Grid2>
                        <Grid2 item size={4}>
                            <Typography variant="body2" sx={{ textAlign: 'center', minWidth: 105 }}>
                                Score
                            </Typography>
                        </Grid2>
                    </Grid2>
                
                    {columnData.map((letter) => (
                    <Grid2 container item columnSpacing={2} rowSpacing={2} key={letter.letter} 
                        sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Grid2 item size={4}>
                            <Paper
                                sx={{
                                width: 35,
                                height: 35,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'beige',
                                }}
                            >
                                <Typography
                                variant="body2"
                                sx={{ fontWeight: 400, fontSize: 20 }}
                                >
                                {letter.letter}
                                </Typography>
                            </Paper>
                        </Grid2>

                        <Grid2 item size={4}>
                            <NumberInput
                                placeholder="Count"
                                value={letter.count}
                                onChange={(e, val) => handleNumberInputChange(letter.originalIndex, 'count', val)}
                                min={0} 
                                max={15}
                                />
                        </Grid2>

                        <Grid2 item size={4}>
                            <NumberInput
                                placeholder="Score"
                                value={letter.points}
                                onChange={(e, val) => handleNumberInputChange(letter.originalIndex, 'points', val)}
                                min={0} 
                                max={10}
                                />
                        </Grid2>

                    </Grid2>
                    ))}
                </Grid2>
                ))}
        </Grid2>

        <Box sx={{mt: 3, mx: 'auto', width: 'fit-content'}}>
            <Button 
                variant="contained" 
                sx={{textTransform: 'none'}}
                startIcon={<SaveIcon />}
                //onClick={handleSave}
                >
                Save Changes
            </Button>
        </Box>
        </Paper>
    </>
    );
}

export default LetterBagEditorPage;