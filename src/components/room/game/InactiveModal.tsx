import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import useSocket from '../../../hooks/useSocket';
import useAuth from '../../../hooks/useAuth';
import { useParams } from 'react-router-dom';

interface Props {
    open: boolean;
    onClose: () => void;
}

function InactiveModal({ open, onClose }: Props) {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();

    function handlePlayerIsBack() {
        socket?.emit('playerIsBack', roomId, user?._id)
        onClose()
    }

    return (
        <Dialog
            open={open}
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
