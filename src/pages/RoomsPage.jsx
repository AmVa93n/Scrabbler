import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/AddCircle';
import JoinIcon from '@mui/icons-material/Login';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useNavigate } from "react-router-dom";

function RoomsPage() {
  const [rooms, setRooms] = useState([])
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

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  return (
    <>
        {rooms.map(room => (
            <Card variant="outlined" key={room._id}>
                <CardContent>
                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                        {room.name}
                    </Typography>
                </CardContent>
                <CardActions>
                <Button variant="contained" startIcon={<JoinIcon />} onClick={handleJoin} id={room._id}>
                    Join
                </Button>
                <Button variant="contained" startIcon={<EditIcon />} component={Link} to="/rooms/edit">
                    Edit
                </Button>
                <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleDelete} id={room._id}>
                    Delete
                </Button>
                </CardActions>
            </Card>
        ))}
        <Button variant="contained" startIcon={<CreateIcon />} component={Link} to="/rooms/create">
            Create Room
        </Button>
    </>
  );
}

export default RoomsPage;
