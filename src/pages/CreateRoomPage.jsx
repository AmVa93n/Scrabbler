//import { useState } from 'react';
import accountService from "../services/account.service";
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/AddCircle';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useNavigate } from "react-router-dom";

function CreateRoomPage() {
  const notifications = useNotifications();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = {
        name: event.currentTarget.name.value,  // Retrieve the value from the form input
    };

    try {
        await accountService.createRoom(formData)
        notify('Successfully created room!','success',5000)
        navigate("/rooms");
    } catch (error) {
        const errorDescription = error.response.data.message;
        notify(errorDescription,'error',5000)
    }
  }

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  return (
    <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
        <FormControl>
            <FormLabel htmlFor="name">Room name</FormLabel>
            <TextField
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Just me and the boys"
            />
        </FormControl>
        <Button variant="contained" startIcon={<CreateIcon />} type="submit">
            Create Room
        </Button>
    </Box>
  );
}

export default CreateRoomPage;
