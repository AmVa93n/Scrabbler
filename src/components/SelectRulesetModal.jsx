import { useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, InputLabel, Select, MenuItem, FormControl, 
    Typography, Slider, Box } from '@mui/material';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { useSocket } from '../context/socket.context';
import accountService from "../services/account.service";

function SelectRulesetModal() {
    const { roomId, usersInRoom, hostId, setBankSize } = useContext(RoomContext)
    const { isRulesetSelectOpen, setIsRulesetSelectOpen } = useContext(GameContext)
    const socket = useSocket();
    const [settings, setSettings] = useState(null)
    const [boards, setBoards] = useState([])
    const [letterBags, setLetterBags] = useState([])

    useEffect(() => {
        async function init() {
          try {
            const boards = await accountService.getBoards()
            setBoards(boards)
            const letterBags = await accountService.getLetterBags()
            setLetterBags(letterBags)
            setSettings({ 
                board: boards[0]._id, 
                letterBag: letterBags[0]._id,
                turnDuration: 180,
                turnsUntilSkip: 3,
                bankSize: 7
            });
          } catch (error) {
            const errorDescription = error.response.data.message;
            alert(errorDescription,'error',5000)
          }
        }
        init()
    }, [])

    function handleChange(e, field) {
        let value = e.target.value
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    function handleConfirm() { 
        const board = boards.find(board => board._id === settings.board)
        const letterBag = letterBags.find(bag => bag._id === settings.letterBag)
        const gameSettings = { ...settings, board, letterBag}
        const gameSession = {players: [...usersInRoom], settings: gameSettings}
        socket.emit('startGame', roomId, hostId, gameSession)
        setIsRulesetSelectOpen(false)
        setBankSize(settings.bankSize)
    }

    function handleCancel() {
        setIsRulesetSelectOpen(false)
    }

    return (
        <Dialog
            open={isRulesetSelectOpen}
            onClose={() => setIsRulesetSelectOpen(false)}
        >
            <DialogTitle>Game Settings</DialogTitle>
            <DialogContent>
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
                    <InputLabel id="letterBag">Letter Bag</InputLabel>
                    <Select
                        labelId="letterBag"
                        label="Letter Bag"
                        value={settings?.letterBag}
                        onChange={(e) => handleChange(e,"letterBag")}
                        >
                        {letterBags.map(letterBag => (
                            <MenuItem key={letterBag._id} value={letterBag._id}>{letterBag.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{m: 1}}>
                    <Typography id="input-slider" gutterBottom>
                        Letter Bank Size
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

                <Box sx={{m: 1}}>
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

                <Box sx={{m: 1}}>
                    <Typography id="input-slider" gutterBottom>
                        Number of consecutive missed turns until a player may be skipped
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
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm} variant="contained" color="success">
                    Confirm
                </Button>
                <Button onClick={handleCancel} variant="contained" color="info">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SelectRulesetModal;