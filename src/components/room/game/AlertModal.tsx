import { Dialog, DialogContent, Typography } from '@mui/material';

interface Props {
    open: boolean;
    onClose: () => void;
    message: string;
}

function AlertModal({ open, onClose, message }: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogContent>
                <Typography id="modal-title" variant="h6" component="h2">
                    {message}
                </Typography>
            </DialogContent>
        </Dialog>
    );
}

export default AlertModal;
