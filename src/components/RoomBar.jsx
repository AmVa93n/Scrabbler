import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/socket.context';
import { RoomContext } from '../context/room.context';
import { AppBar, Box, Toolbar, Typography, Button, Snackbar } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import DoorBackIcon from '@mui/icons-material/DoorBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RulesModal from './RulesModal'

function RoomBar() {
    const { roomName, setIsRulesOpen } = useContext(RoomContext)
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const socket = useSocket();

    async function handleCopyLink() {
        const currentUrl = window.location.href;
        await navigator.clipboard.writeText(currentUrl)
        setIsSnackbarOpen(true)
    }

    function handleLeaveRoom() {
        socket.emit('leaveRoom', 'left');
    }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>

          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Scrabbler
          </Typography>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {roomName}
          </Typography>

            <Button 
                variant="contained" 
                startIcon={<HelpIcon />}
                color='info'
                sx= {{textTransform: 'none'}}
                onClick={()=>setIsRulesOpen(true)}
                >
                    Rules
            </Button>

            <RulesModal />

            <Button 
                variant="contained" 
                startIcon={<ContentCopyIcon />}
                sx= {{textTransform: 'none', bgcolor: 'grey', ml: 1}}
                onClick={handleCopyLink}
                >
                    Copy Room Link
            </Button>

            <Snackbar 
                open={isSnackbarOpen} 
                autoHideDuration={3000} 
                onClose={()=>{setIsSnackbarOpen(false)}}
                message="Room link copied to clipboard!"
            />
          
            <Button 
                variant="contained" 
                color="error" 
                startIcon={<DoorBackIcon />}
                sx= {{textTransform: 'none', ml: 1}}
                onClick={handleLeaveRoom}
                component={Link} 
                to={'/rooms'} 
                >
                Leave Room
            </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default RoomBar