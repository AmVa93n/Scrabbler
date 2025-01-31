import { useEffect, useState } from 'react';
import { Button, InputLabel, Select, MenuItem, FormControl, Typography, Slider, Box, RadioGroup, FormControlLabel, Radio, 
    Stack,SelectChangeEvent, Avatar} from '@mui/material';
import useSocket from '../../../hooks/useSocket';
import appService from "../../../services/app.service";
import SettingsIcon from '@mui/icons-material/Settings';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import useRoom from '../../../hooks/useRoom';
import useAntiSpam from '../../../hooks/useAntiSpam';

function GameSettings() {
    const { usersInRoom, room, boards, tileBags } = useRoom();
    const { canClick, setCanClick } = useAntiSpam();
    const { socket } = useSocket();
    const [settings, setSettings] = useState({ 
        board: '', 
        tileBag: '',
        gameEnd: 'classic',
        turnDuration: 180,
        turnsUntilSkip: 3,
        rackSize: 7
    })
    const [selectedUserIds, setSelectedUserIds] = useState([] as string[])
    const selectedUsers = usersInRoom.filter(user => selectedUserIds.includes(user._id))

    useEffect(() => {
        setSettings((prev) => ({ ...prev, board: boards[0]?._id || '', tileBag: tileBags[0]?._id || '' }));
    }, [boards, tileBags])

    function handleChange(e: Event | SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>, field: string) {
        const value = e.target ? (e.target as HTMLInputElement).value : (e as SelectChangeEvent<string>).target.value
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    async function handleStartGame() { 
        const board = boards.find(board => board._id === settings.board)
        const tileBag = tileBags.find(bag => bag._id === settings.tileBag)
        const gameSettings = { ...settings, board, tileBag}
        const gameSession = {players: selectedUsers, settings: gameSettings}
        const response = await appService.ping()
        if (response) {
            socket?.emit('startGame', room?._id, room?.creator, gameSession)
            setCanClick(false)
        } else {
            alert('The server is down. Refresh the page and try again')
        }
    }

    return (
        <Box sx={{
            width: '100%', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Box sx={{display: 'flex', mb: 'auto', alignItems: 'center'}}>
                <SettingsIcon sx={{mr: 1}} />
                <Typography variant="h5">Game Settings</Typography>
            </Box>

            <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                <InputLabel id="players">Players</InputLabel>
                <Select
                    fullWidth
                    labelId="players"
                    label="Players"
                    value={selectedUserIds}
                    onChange={(e) => setSelectedUserIds(e.target.value as string[])}
                    multiple
                    renderValue={(selected) => selected.map(id => usersInRoom.find(user => user._id === id)?.name).join(', ')}
                >
                    {usersInRoom.map(user => (
                        <MenuItem key={user._id} value={user._id}>
                            <Avatar src={user.profilePic} sx={{mr: 1, width: 24, height: 24}} />
                            {user.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Stack direction={'row'} sx={{mb: 3}}>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                    <InputLabel id="board">Board</InputLabel>
                    <Select
                        labelId="board"
                        label="Board"
                        value={settings?.board}
                        onChange={(e) => handleChange(e,"board")}
                        >
                        {boards.map(board => (
                            <MenuItem key={board._id} value={board._id}>{board.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                    <InputLabel id="tileBag">Tile Bag</InputLabel>
                    <Select
                        labelId="tileBag"
                        label="Tile Bag"
                        value={settings?.tileBag}
                        onChange={(e) => handleChange(e,"tileBag")}
                        >
                        {tileBags.map(tileBag => (
                            <MenuItem key={tileBag._id} value={tileBag._id}>{tileBag.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <FormControl>
                <Typography gutterBottom>End of Game</Typography>
                <RadioGroup
                value={settings?.gameEnd}
                onChange={(e) => handleChange(e,"gameEnd")}
                row
                >
                <FormControlLabel value="classic" control={<Radio />} label="Classic" />
                <FormControlLabel value="alternative" control={<Radio />} label="Alternative" />
                </RadioGroup>
            </FormControl>

            <Box sx={{m: 1, minWidth: 500}}>
                <Typography id="input-slider" gutterBottom>
                    Rack Size
                </Typography>
                <Slider
                    value={settings?.rackSize}
                    onChange={(e) => handleChange(e,"rackSize")}
                    step={1}
                    min={5}
                    max={10}
                    valueLabelDisplay="auto"
                    marks={
                        [
                            {value: 5, label: '5'},
                            {value: 7, label: '7 (Default)'},
                            {value: 10, label: '10'},
                        ]
                    }
                />
            </Box>

            <Box sx={{m: 1, minWidth: 500}}>
                <Typography id="input-slider" gutterBottom>
                    Turn Duration (in seconds)
                </Typography>
                <Slider
                    value={settings?.turnDuration}
                    onChange={(e) => handleChange(e,"turnDuration")}
                    step={30}
                    min={60}
                    max={600}
                    valueLabelDisplay="auto"
                    marks={
                        [
                            {value: 60, label: '60'},
                            {value: 180, label: '180 (Default)'},
                            {value: 600, label: '600'},
                        ]
                    }
                />
            </Box>

            <Box sx={{m: 1, minWidth: 500}}>
                <Typography id="input-slider" gutterBottom>
                    Number of consecutive missed turns until a player is skipped
                </Typography>
                <Slider
                    value={settings?.turnsUntilSkip}
                    onChange={(e) => handleChange(e,"turnsUntilSkip")}
                    step={1}
                    min={1}
                    max={5}
                    valueLabelDisplay="auto"
                    marks={
                        [
                            {value: 1, label: '1'},
                            {value: 5, label: '5'},
                        ]
                    }
                />
            </Box>
            
            <Button 
                variant="contained" 
                sx={{textTransform: 'none'}}
                startIcon={<PlayCircleIcon />} 
                color="success"
                onClick={handleStartGame} 
                disabled={selectedUsers.length === 0 || !canClick}>
                    Start Game
            </Button>
                
        </Box>
    );
}

export default GameSettings;