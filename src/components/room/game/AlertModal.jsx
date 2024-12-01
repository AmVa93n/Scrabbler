import { useContext } from 'react';
import { Dialog, DialogContent, Typography } from '@mui/material';
import { AlertContext } from '../../../context/modal.context';

function AlertModal() {
    const { isAlertOpen, setIsAlertOpen, alertMessage } = useContext(AlertContext)

    return (
        <Dialog
            open={isAlertOpen}
            onClose={() => setIsAlertOpen(false)}
        >
            <DialogContent>
                <Typography id="modal-title" variant="h6" component="h2">
                    {alertMessage}
                </Typography>
            </DialogContent>
        </Dialog>
    );
}

export default AlertModal;
