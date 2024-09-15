import accountService from "../services/account.service";
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/AddCircle';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useNotifications } from '@toolpad/core/useNotifications';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function CreateRoom({ creating, setCreating, setRooms }) {
  const notifications = useNotifications();

  async function handleCreate(event) {
    event.preventDefault();
    const formData = {
        name: event.currentTarget.name.value,
        description: event.currentTarget.description.value,
    };

    try {
        const createdRoom = await accountService.createRoom(formData)
        setRooms((prev)=> [...prev, createdRoom])
        notify('Successfully created room!','success',5000)
    
    } catch (error) {
        const errorDescription = error.response.data.message;
        notify(errorDescription,'error',5000)
    }
    setCreating(false)
  }

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  return (
    <Dialog
        open={creating}
        component="form"
        onSubmit={handleCreate}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}
        fullWidth
    >
      <DialogTitle>
        Create a new room
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormControl>
            <FormLabel htmlFor="name">Room name</FormLabel>
            <TextField
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Scrabble and chill"
                size="small"
                sx={{mb: 2}}
            />
        </FormControl>
        <FormControl>
            <FormLabel htmlFor="name">Room Description</FormLabel>
            <TextField
                name="description"
                required
                fullWidth
                id="description"
                placeholder="Tell others what the room is for..."
                multiline
                rows={4}
            />
        </FormControl>
      </DialogContent>
      
      <DialogActions>
        <Button variant="contained" sx={{textTransform: 'none'}} startIcon={<CreateIcon />} type="submit">
            Create
        </Button>
        <Button sx={{textTransform: 'none'}} onClick={()=>setCreating(false)}>
            Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateRoom;
