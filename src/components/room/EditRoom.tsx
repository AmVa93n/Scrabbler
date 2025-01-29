import React, { useState } from 'react'
import accountService from "../../services/account.service";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useNotifications } from '@toolpad/core/useNotifications';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Room } from '../../types';

interface Props {
  room: Room;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  onClose: () => void;
}

function EditRoom({ room, setRooms, onClose }: Props) {
  const notifications = useNotifications();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(room.image || "/room-default.jpg");

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);

    try {
        const editedRoom = await accountService.updateRoom(room._id, formData)
        setRooms(prev => prev.map(room => room._id === editedRoom._id ? editedRoom : room))
        notifications.show('Successfully edited room!', { severity: 'success', autoHideDuration: 5000 });
    } catch (error) {
        console.error(error)
        const errorDescription = "Failed to edit room";
        notifications.show(errorDescription, { severity: 'error', autoHideDuration: 5000 });
    }
    onClose()
  }

  function handleFilePreview(event: React.ChangeEvent<HTMLInputElement>) {
    const reader = new FileReader();
    reader.onload = function(){
      setImagePreview(reader.result)
    }
    const file = event.target.files?.[0];
    if (file) reader.readAsDataURL(file);
  }

  return (
    <Dialog
        open={!!room}
        TransitionProps={{onEnter: ()=>setImagePreview(room?.image || "/room-default.jpg")}}
        component="form"
        onSubmit={handleSave}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}
        fullWidth
        disableScrollLock
    >
      <DialogTitle>
        Editing "{room?.name}"
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
                defaultValue={room?.name}
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
                defaultValue={room?.description}
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
        <Button variant="contained" sx={{textTransform: 'none'}} startIcon={<SaveIcon />} type="submit">
            Save Changes
        </Button>
        <Button sx={{textTransform: 'none'}} onClick={onClose}>
            Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditRoom;
