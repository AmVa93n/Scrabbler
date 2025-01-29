import useSocket from '../hooks/useSocket';
import { ChangeEvent, useEffect, useState } from 'react';
import accountService from "../services/account.service";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { Button, Select, MenuItem, Typography, Box, Grid2, Paper, TextField, SelectChangeEvent } from '@mui/material';
import NumberInput from '../components/NumberInput';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotifications } from '@toolpad/core/useNotifications';
import { TileBag, TileData } from '../types';
import useAuth from '../hooks/useAuth';

function TileBagEditorPage() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [tileBags, setTileBags] = useState([] as TileBag[])
    const [editedBag, setEditedBag] = useState<TileBag | null>(null)
    const notifications = useNotifications();

    useEffect(() => {
        if (socket) socket.emit('leaveRoom', 'left');

        async function init() {
            try {
                const tileBags = await accountService.getTileBags()
                const tileBagsByUser = tileBags.filter((bag: TileBag) => bag.creator)
                setTileBags(tileBagsByUser)
            } catch (error) {
                console.error(error)
                alert('Failed to fetch tile bags')
            }
        }
        init()
    }, [socket]);

    function handleChangeBag(e: SelectChangeEvent) {
        const selectedBag = tileBags.find(bag => bag._id === e.target.value)!
        setEditedBag(selectedBag)
    };

    function handleChange(e: SelectChangeEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setEditedBag(prev => prev && ({...prev, name: e.target.value}))
    };

    function handleNumberInputChange(index: number, key: string, value: number) {
        setEditedBag((prevBag) => {
            if (!prevBag) return prevBag;
            const updatedLetterData = [...prevBag.letterData];
            updatedLetterData[index] = {...updatedLetterData[index], [key]: value,};
            return { ...prevBag, letterData: updatedLetterData };
        });
    };

    function createThreeColumns(acc: TileData[][], curr: TileData, index: number) {
        if (index < 9) acc[0].push({ ...curr, originalIndex: index }) 
        else if (index < 18) acc[1].push({ ...curr, originalIndex: index })
        else acc[2].push({ ...curr, originalIndex: index })
        return acc;
    }

    function sortAlphabetically(a: TileData, b: TileData) {
        if (a.letter === '') return 1; // Move blank tile to the end
        if (b.letter === '') return -1; 
        return a.letter.localeCompare(b.letter); // Standard alphabetical sorting
    }

    async function handleCreate() {
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
              ],
              creator: user!._id
        } as Omit<TileBag, '_id'>
        try {
            const createdBag = await accountService.createTileBag(NewBag)
            setTileBags((prev)=> [...prev, createdBag])
            notifications.show('Successfully created bag!', { severity: 'success', autoHideDuration: 5000 });
            setEditedBag(createdBag)
        } catch (error) {
            console.error(error)
            notifications.show("Failed to create new bag", { severity: 'error', autoHideDuration: 5000 });
        }
    }

    async function handleSave() {
        if (!editedBag) return;
        try {
            const updatedBag = await accountService.updateTileBag(editedBag)
            setTileBags(prev => prev.map(bag => bag._id === editedBag._id ? updatedBag : bag));
            notifications.show('Successfully saved changes to bag!', { severity: 'success', autoHideDuration: 5000 });
            setEditedBag(null)
        } catch (error) {
            console.error(error)
            const errorDescription = "Failed to save changes to bag"
            notifications.show(errorDescription, { severity: 'error', autoHideDuration: 5000 });
        }
    }

    async function handleDelete() {
        if (!editedBag) return;
        try {
            await accountService.deleteTileBag(editedBag._id)
            setTileBags((prev) => prev.filter((bag) => bag._id !== editedBag._id));
            notifications.show('Successfully deleted bag!', { severity: 'success', autoHideDuration: 5000 });
            setEditedBag(null)
        } catch (error) {
            console.error(error)
            const errorDescription = "Failed to delete bag"
            notifications.show(errorDescription, { severity: 'error', autoHideDuration: 5000 });
        }
    }

    return (
        <Paper sx={{p: 2, width: 'fit-content', mx: 'auto', my: 2}}>
            <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', pb: 2}}>
                <FontDownloadIcon sx={{mr: 1}} />
                <Typography variant="h5">Tile Bag Editor</Typography>
            </Box>

            <Select
                sx={{ width: 200, mx: 'auto', mb: 4, display: 'block' }} size="small"
                value={!editedBag ? '' : (editedBag as TileBag)._id}
                onChange={handleChangeBag}
                MenuProps={{disableScrollLock: true}}
                >
                {tileBags.map(tileBag => (
                    <MenuItem key={tileBag._id} value={tileBag._id}>{tileBag.name}</MenuItem>
                ))}
            </Select>
            
            {editedBag &&
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '50%', justifyContent: 'space-between'}}>
                <TextField label="Name" size="small" value={editedBag?.name || ''} onChange={handleChange}/>
                <Typography variant="body2" sx={{fontSize: 16}}>
                    Total Letters: {editedBag?.letterData?.reduce((acc, letter) => acc + letter.count, 0)}
                </Typography>
            </Box>}

            <Grid2 container spacing={4}>
                {/* Split sorted array into two parts */}
                {editedBag && editedBag.letterData.sort(sortAlphabetically)
                .reduce(createThreeColumns, [[], [], []]) // Initial accumulator with two empty arrays
                .map((columnData, columnIndex) => (
                    <Grid2 size={4} key={columnIndex}>

                        {/* Header Row */}
                        <Grid2 container spacing={2}>
                            <Grid2 size={4}>
                                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                    Letter
                                </Typography>
                            </Grid2>
                            <Grid2 size={4}>
                                <Typography variant="body2" sx={{ textAlign: 'center', minWidth: 105 }}>
                                    Count
                                </Typography>
                            </Grid2>
                            <Grid2 size={4}>
                                <Typography variant="body2" sx={{ textAlign: 'center', minWidth: 105 }}>
                                    Score
                                </Typography>
                            </Grid2>
                        </Grid2>
                    
                        {columnData.map((letter) => (
                        <Grid2 container columnSpacing={2} rowSpacing={2} key={letter.letter} 
                            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Grid2 size={4}>
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

                            <Grid2 size={4}>
                                <NumberInput
                                    placeholder="Count"
                                    value={letter.count}
                                    onChange={(_: Event, val: number) => handleNumberInputChange(letter.originalIndex!, 'count', val)}
                                    min={0} 
                                    max={25}
                                    />
                            </Grid2>

                            <Grid2 size={4}>
                                <NumberInput
                                    placeholder="Score"
                                    value={letter.points}
                                    onChange={(_: Event, val: number) => handleNumberInputChange(letter.originalIndex!, 'points', val)}
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
                {editedBag ?
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
    );
}

export default TileBagEditorPage;