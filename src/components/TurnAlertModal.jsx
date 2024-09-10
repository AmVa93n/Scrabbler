import { useContext } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { GameContext } from '../context/game.context';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function TurnAlertModal() {
    const { isModalOpen, setIsModalOpen, modalMessage } = useContext(GameContext)

    return (
        <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    {modalMessage}
                </Typography>
                <Button onClick={() => setIsModalOpen(false)} sx={{ mt: 2 }} variant="contained">
                    Close
                </Button>
            </Box>
        </Modal>
    );
}

export default TurnAlertModal;
