import { useContext } from 'react';
import { Dialog, DialogContent, Typography, Button } from '@mui/material';
import { GameContext } from '../context/game.context';

function AlertModal() {
    const { isModalOpen, setIsModalOpen, modalMessage } = useContext(GameContext)

    return (
        <Dialog
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        >
            <DialogContent>
                <Typography id="modal-title" variant="h6" component="h2">
                    {modalMessage}
                </Typography>
                <Button onClick={() => setIsModalOpen(false)} sx={{ mt: 2 }} variant="contained">
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
}

export default AlertModal;
