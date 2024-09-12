import { useContext } from 'react';
import { Dialog, DialogContent, Typography, Button } from '@mui/material';
import { RoomContext } from '../context/room.context';
import { GameContext } from '../context/game.context';
import { useSocket } from '../context/socket.context';

function SelectRulesetModal() {
    const { roomId, usersInRoom, hostId } = useContext(RoomContext)
    const { isRulesetSelectOpen, setIsRulesetSelectOpen } = useContext(GameContext)
    const socket = useSocket();

    function handleConfirm() { 
        const gameSession = {players: [...usersInRoom]}
        socket.emit('startGame', roomId, hostId, gameSession)
        setIsRulesetSelectOpen(false)
    }

    return (
        <Dialog
            open={isRulesetSelectOpen}
            onClose={() => setIsRulesetSelectOpen(false)}
        >
            <DialogContent>
                <Typography id="modal-title" variant="h6" component="h2">
                    Select Ruleset
                </Typography>
                <Button onClick={handleConfirm} sx={{ mt: 2 }} variant="contained" color="success">
                    Confirm
                </Button>
                <Button onClick={() => setIsRulesetSelectOpen(false)} sx={{ mt: 2 }} variant="contained" color="secondary">
                    Cancel
                </Button>
            </DialogContent>
        </Dialog>
    );
}

export default SelectRulesetModal;