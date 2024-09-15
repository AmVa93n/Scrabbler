import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import CreateIcon from '@mui/icons-material/AddCircle';
import JoinIcon from '@mui/icons-material/Login';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useNavigate } from "react-router-dom";
import { Box, Card, CardActions, CardContent, CardMedia, Typography, Button } from '@mui/material';
import CreateRoom from "../components/CreateRoom";

function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate();
  const notifications = useNotifications();

  useEffect(() => {
    async function init() {
      try {
        const rooms = await accountService.getRooms()
        setRooms(rooms)
      } catch (error) {
        const errorDescription = error.response.data.message;
        alert(errorDescription);
      }
    }
    init()
  }, [])

  async function handleDelete(event) {
    const roomId = event.target.id
    try {
        await accountService.deleteRoom(roomId)
        notify('Successfully deleted room!','success',5000)
        // Filter the room out of the state
        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
    } catch (error) {
        const errorDescription = error.response.data.message;
        notify(errorDescription,'error',5000)
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    const roomId = event.target.id
    try {
        await accountService.getRoom(roomId)
        navigate(`/rooms/${roomId}`);
        
    } catch (error) {
        const errorDescription = error.response.data.message;
        notify(errorDescription,'error',5000)
    }
  }

  function handleCreate() {
    setCreating(true)
  }

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  return (
    <>
      <Box sx={{mx: 'auto', mt: 2, width: 'fit-content', maxWidth: '80%'}}>
          {rooms.map(room => (
              <Card sx={{ maxWidth: 345 }} key={room._id}>
                <CardMedia
                  sx={{ height: 140 }}
                  image="/room-default.jpg"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {room.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {room.description}
                  </Typography>
                </CardContent>
                <CardActions>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<JoinIcon />} 
                      onClick={handleJoin} 
                      id={room._id}
                      sx={{textTransform: 'none'}}
                      >
                        Join
                    </Button>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<EditIcon />}  
                      to="/rooms/edit"
                      sx={{textTransform: 'none'}}
                      >
                        Edit
                    </Button>
                    <Button 
                      size='small' 
                      variant="contained" 
                      startIcon={<DeleteIcon />} 
                      onClick={handleDelete} 
                      id={room._id} 
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

        <Box sx={{mt: 3, mx: 'auto', width: 'fit-content'}}>
          <Button 
            variant="contained" 
            startIcon={<CreateIcon />} 
            onClick={handleCreate}
            sx={{textTransform: 'none'}}
            >
              Create Room
          </Button>
        </Box>
        <CreateRoom creating={creating} setCreating={setCreating}/>
    </>
  );
}

export default RoomsPage;
