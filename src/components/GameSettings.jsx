import { useContext, useEffect, useState } from 'react';
import { Button, InputLabel, Select, MenuItem, FormControl, Typography, Slider, Box, RadioGroup, FormControlLabel, 
    Radio, Stack} from '@mui/material';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { useSocket } from '../context/socket.context';
import accountService from "../services/account.service";
import SettingsIcon from '@mui/icons-material/Settings';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

function GameSettings() {
    const { roomId, usersInRoom, hostId, setBankSize } = useContext(RoomContext)
    const { canClick, setCanClick } = useContext(GameContext)
    const socket = useSocket();
    const [settings, setSettings] = useState({ 
        board: '', 
        letterBag: '',
        gameEnd: 'classic',
        turnDuration: 180,
        turnsUntilSkip: 3,
        bankSize: 7
    })
    const [boards, setBoards] = useState([])
    const [letterBags, setLetterBags] = useState([])

    useEffect(() => {
        async function init() {
          try {
            const boards = await accountService.getBoards()
            setBoards(boards)
            const letterBags = await accountService.getLetterBags()
            setLetterBags(letterBags)
            setSettings((prev) => ({ ...prev, board: boards[0]._id, letterBag: letterBags[0]._id }));
          } catch (error) {
            const errorDescription = error.response.data.message;
            alert(errorDescription)
          }
        }
        init()
    }, [])

    function handleChange(e, field) {
        let value = e.target.value
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    async function handleStartGame() { 
        const board = boards.find(board => board._id === settings.board)
        const letterBag = letterBags.find(bag => bag._id === settings.letterBag)
        const gameSettings = { ...settings, board, letterBag}
        const gameSession = {players: [...usersInRoom], settings: gameSettings}
        const response = await accountService.ping()
        if (response) {
            socket.emit('startGame', roomId, hostId, gameSession)
            setCanClick(false)
            setBankSize(settings.bankSize)
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
                    <InputLabel id="letterBag">Tile Bag</InputLabel>
                    <Select
                        labelId="letterBag"
                        label="Tile Bag"
                        value={settings?.letterBag}
                        onChange={(e) => handleChange(e,"letterBag")}
                        >
                        {letterBags.map(letterBag => (
                            <MenuItem key={letterBag._id} value={letterBag._id}>{letterBag.name}</MenuItem>
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
                    value={settings?.bankSize}
                    onChange={(e) => handleChange(e,"bankSize")}
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
                disabled={usersInRoom.length < 1 || !canClick}>
                    Start Game
            </Button>
                
        </Box>
    );
}

export default GameSettings;