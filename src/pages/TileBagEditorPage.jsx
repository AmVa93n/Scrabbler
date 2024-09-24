import { useSocket } from '../context/socket.context';
import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { Button, Select, MenuItem, Typography, Box, Grid2, Paper, TextField } from '@mui/material';
import NumberInput from '../components/NumberInput';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotifications } from '@toolpad/core/useNotifications';

function TileBagEditorPage() {
    const socket = useSocket();
    const [tileBags, setTileBags] = useState([])
    const [currentBag, setCurrentBag] = useState(null)
    const notifications = useNotifications();

    useEffect(() => {
        if (socket) socket.emit('leaveRoom', 'left');

        async function init() {
            try {
                let tileBags = await accountService.getTileBags()
                tileBags = tileBags.filter(bag => bag.creator)
                setTileBags(tileBags)
            } catch (error) {
                const errorDescription = error.response.data.message;
                alert(errorDescription,'error',5000)
            }
        }
        init()
    }, [socket]);

    function handleChangeBag(e) {
        const selectedBag = tileBags.find(bag => bag._id === e.target.value)
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

    function handleCreate() {
        const NewBag = {
            name: 'Unnamed Bag',
            letterData: [
                { letter: '', count: 2, points: 0 },
                { letter: 'E', count: 12, points: 1 },
                { letter: 'A', count: 9, points: 1 },
                { letter: 'I', count: 9, points: 1 },
                { letter: 'O', count: 8, points: 1 },
                { letter: 'N', count: 6, points: 1 },
                { letter: 'R', count: 6, points: 1 },
                { letter: 'T', count: 6, points: 1 },
                { letter: 'L', count: 4, points: 1 },
                { letter: 'S', count: 4, points: 1 },
                { letter: 'U', count: 4, points: 1 },
                { letter: 'D', count: 4, points: 2 },
                { letter: 'G', count: 3, points: 2 },
                { letter: 'B', count: 2, points: 3 },
                { letter: 'C', count: 2, points: 3 },
                { letter: 'M', count: 2, points: 3 },
                { letter: 'P', count: 2, points: 3 },
                { letter: 'F', count: 2, points: 4 },
                { letter: 'H', count: 2, points: 4 },
                { letter: 'V', count: 2, points: 4 },
                { letter: 'W', count: 2, points: 4 },
                { letter: 'Y', count: 2, points: 4 },
                { letter: 'K', count: 1, points: 5 },
                { letter: 'J', count: 1, points: 8 },
                { letter: 'X', count: 1, points: 8 },
                { letter: 'Q', count: 1, points: 10 },
                { letter: 'Z', count: 1, points: 10 }
              ]
        }
        setCurrentBag(NewBag)
    }

    async function handleSave() {
        if (currentBag.creator) { // edit existing bag
            try {
                const updatedBag = await accountService.updateTileBag(currentBag)
                setTileBags(prev => prev.map(bag => bag === currentBag ? updatedBag : bag));
                notify('Successfully edited bag!','success',5000)
            } catch (error) {
                const errorDescription = error.response.data.message;
                notify(errorDescription,'error',5000)
            }
        } else { // create new bag
            try {
                const createdBag = await accountService.createTileBag(currentBag)
                setTileBags((prev)=> [...prev, createdBag])
                notify('Successfully created bag!','success',5000)
                setCurrentBag(createdBag)
            } catch (error) {
                const errorDescription = error.response.data.message;
                notify(errorDescription,'error',5000)
            }
        }
    }

    async function handleDelete() {
        if (currentBag.creator) { // delete existing bag
            try {
                await accountService.deleteTileBag(currentBag._id)
                notify('Successfully deleted bag!','success',5000)
                setTileBags((prev) => prev.filter((bag) => bag._id !== currentBag._id));
            } catch (error) {
                const errorDescription = error.response.data.message;
                notify(errorDescription,'error',5000)
            }
        }
        setCurrentBag(null)
    }

    function notify(message, type, duration) {
        notifications.show(message, {
          severity: type,
          autoHideDuration: duration,
        });
    }

    return (
    <>
        <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', mt: 2}}>
            <FontDownloadIcon sx={{mr: 1}} />
            <Typography variant="h5">Tile Bag Editor</Typography>
        </Box>

        <Paper sx={{p: 2, width: 'fit-content', mx: 'auto', my: 2}}>
            <Select
                sx={{ width: 200, mx: 'auto', mb: 4, display: 'block' }} size="small"
                value={currentBag?._id || ''}
                onChange={handleChangeBag}
                MenuProps={{disableScrollLock: true}}
                >
                {tileBags.map(tileBag => (
                    <MenuItem key={tileBag._id} value={tileBag._id}>{tileBag.name}</MenuItem>
                ))}
            </Select>
            
            {currentBag &&
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '50%', justifyContent: 'space-between'}}>
                <TextField label="Name" size="small" value={currentBag?.name || ''} onChange={handleChange}/>
                <Typography variant="body2" sx={{fontSize: 16}}>
                    Total Letters: {currentBag?.letterData?.reduce((acc, letter) => acc + letter.count, 0)}
                </Typography>
            </Box>}

        <Grid2 container spacing={4}>
            {/* Split sorted array into two parts */}
            {currentBag && currentBag.letterData.sort(sortAlphabetically)
            .reduce(createThreeColumns, [[], [], []]) // Initial accumulator with two empty arrays
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
                                max={25}
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
            {currentBag ?
            <>
                <Button 
                    variant="contained" 
                    sx={{textTransform: 'none', mx: 1}}
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    >
                    Save Changes
                </Button>
                <Button 
                    variant="contained" 
                    sx={{textTransform: 'none', mx: 1}}
                    startIcon={<DeleteIcon />}
                    color='error'
                    onClick={handleDelete}
                    >
                    Delete Bag
                </Button> 
            </> :
            <Button 
                variant="contained" 
                startIcon={<CreateIcon />} 
                onClick={handleCreate}
                sx={{textTransform: 'none'}}
                >
                Create Bag
            </Button>}
        </Box>
        </Paper>
    </>
    );
}

export default TileBagEditorPage;