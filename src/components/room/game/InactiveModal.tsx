import { useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { RoomContext } from '../../../context/room.context';
import useSocket from '../../../hooks/useSocket';
import { InactiveContext } from '../../../context/modal.context';
import useAuth from '../../../hooks/useAuth';

function InactiveModal() {
    const { isInactiveOpen, setIsInactiveOpen } = useContext(InactiveContext)
    const { roomId } = useContext(RoomContext)
    const { socket } = useSocket();
    const { user } = useAuth();

    function handlePlayerIsBack() {
        setIsInactiveOpen(false)
        socket?.emit('playerIsBack', roomId, user?._id)
    }

    return (
        <Dialog
            open={isInactiveOpen}
        >
            <DialogTitle>Are you still there?</DialogTitle>
            <DialogContent>
                <Typography variant='body2'>
                    You've missed too many turns in a row and from now on considered inactive. 
                    Your turn will be automatically skipped until you're back.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button 
                    variant='outlined'
                    onClick={handlePlayerIsBack} 
                    sx={{ textTransform: 'none' }} 
                >
                    I'm back
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InactiveModal;
