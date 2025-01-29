import { useState } from 'react'
import accountService from "../../services/account.service";
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/AddCircle';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useNotifications } from '@toolpad/core/useNotifications';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Room } from '../../types';

interface Props {
  creating: boolean;
  setCreating: (value: boolean) => void;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

function CreateRoom({ creating, setCreating, setRooms }: Props) {
  const notifications = useNotifications();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>("/room-default.jpg");

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);

    try {
        const createdRoom = await accountService.createRoom(formData)
        setRooms((prev)=> [...prev, createdRoom])
        notifications.show('Successfully created room!', { severity: 'success', autoHideDuration: 5000 });
        setImagePreview("/room-default.jpg")
    
    } catch (error) {
        console.error(error);
        const errorDescription = "Failed to create room"
        notifications.show(errorDescription, { severity: 'error', autoHideDuration: 5000 });
    }
    setCreating(false)
  }

  function handleFilePreview(event) {
    const reader = new FileReader();
    reader.onload = function(){
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  return (
    <Dialog
        open={creating}
        component="form"
        onSubmit={handleCreate}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}
        fullWidth
        disableScrollLock
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
                sx={{mb: 2}}
            />
        </FormControl>

        <FormControl>
          <FormLabel>Room Image</FormLabel>
          <img src={imagePreview as string} alt='' />
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<FileUploadIcon />}
            sx={{ mx: "auto", width: 'fit-content', textTransform: 'none', mt: 1}}
          >
            Upload file
            <input
              hidden
              name="roomImage"
              type="file"
              onChange={handleFilePreview}
            />
          </Button>
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
