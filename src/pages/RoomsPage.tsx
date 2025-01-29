import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import CreateIcon from '@mui/icons-material/AddCircle';
import JoinIcon from '@mui/icons-material/Login';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useNavigate } from "react-router-dom";
import { Box, Card, CardActions, CardContent, CardMedia, Typography, Button } from '@mui/material';
import CreateRoom from "../components/room/CreateRoom";
import EditRoom from "../components/room/EditRoom";
import { Room } from '../types';

function RoomsPage() {
  const [rooms, setRooms] = useState([] as Room[])
  const [creating, setCreating] = useState(false)
  const [editedRoom, setEditedRoom] = useState<Room | null>(null)
  const navigate = useNavigate();
  const notifications = useNotifications();

  useEffect(() => {
    async function init() {
      try {
        const rooms = await accountService.getRooms()
        setRooms(rooms)
      } catch (error) {
        console.error(error)
        alert('Failed to load rooms')
      }
    }
    init()
  }, [])

  async function handleDelete(roomId: string) {
    try {
        await accountService.deleteRoom(roomId)
        notifications.show('Successfully deleted room!', {severity: 'success', autoHideDuration: 5000});
        // Filter the room out of the state
        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
    } catch (error) {
        console.error(error)
        const errorDescription = "Failed to delete room"
        notifications.show(errorDescription, {severity: 'error', autoHideDuration: 5000});
    }
  }

  function handleJoin(roomId: string) {
    navigate(`/rooms/${roomId}`);
  }

  function handleCreate() {
    setCreating(true)
  }

  function handleEdit(roomId: string) {
    const roomToEdit = rooms.find(room => room._id === roomId)!
    setEditedRoom(roomToEdit)
  }

  return (
    <>
      <Box sx={{mx: 'auto', mt: 2, width: 'fit-content', maxWidth: '85%', display: 'flex', flexWrap: 'wrap'}}>
          {rooms.map(room => (
              <Card sx={{ width: 300, m: 1, display: 'flex', flexDirection: 'column' }} key={room._id}>
                <CardMedia
                  sx={{ height: 140 }}
                  image={room.image || "/room-default.jpg"}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {room.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {room.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{mx: 'auto'}}>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<JoinIcon />} 
                      onClick={() => handleJoin(room._id)} 
                      sx={{textTransform: 'none'}}
                      >
                        Join
                    </Button>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<EditIcon />}  
                      onClick={() => handleEdit(room._id)}
                      sx={{textTransform: 'none'}}
                      >
                        Edit
                    </Button>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<DeleteIcon />} 
                      onClick={() => handleDelete(room._id)}
                      color='error'
                      sx={{textTransform: 'none'}}
                      >
                        Delete
                    </Button>
                </CardActions>
              </Card>
            ))
          }
        </Box>

        <Box sx={{mb: 1, mx: 'auto', width: 'fit-content'}}>
          <Button 
            variant="contained" 
            startIcon={<CreateIcon />} 
            onClick={handleCreate}
            sx={{textTransform: 'none'}}
            >
              Create Room
          </Button>
        </Box>
        <CreateRoom creating={creating} setCreating={setCreating} setRooms={setRooms}/>
        {editedRoom && <EditRoom room={editedRoom} onClose={() => setEditedRoom(null)} setRooms={setRooms}/>}
    </>
  );
}

export default RoomsPage;
