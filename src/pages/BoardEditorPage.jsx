import { useSocket } from '../context/socket.context';
import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import GridOnIcon from '@mui/icons-material/GridOn';
import { Button, InputLabel, Select, MenuItem, FormControl, Typography, Box } from '@mui/material';

function BoardEditorPage() {
  const socket = useSocket();
  const [boards, setBoards] = useState([])

  useEffect(() => {
    if (socket) socket.emit('leaveRoom', 'left');

    async function init() {
        try {
          const boards = await accountService.getBoards()
          setBoards(boards)
        } catch (error) {
          const errorDescription = error.response.data.message;
          alert(errorDescription,'error',5000)
        }
      }
      init()
  }, [socket]);

  return (
    <>
      <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', mt: 2}}>
        <GridOnIcon sx={{mr: 1}} />
        <Typography variant="h5">Board Editor</Typography>
      </Box>
    </>
  );
}

export default BoardEditorPage;