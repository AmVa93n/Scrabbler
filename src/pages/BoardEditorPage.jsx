import { useSocket } from '../context/socket.context';
import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import GridOnIcon from '@mui/icons-material/GridOn';
import { Button, Select, MenuItem, Typography, Box, Paper, TextField } from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

function BoardEditorPage() {
  const socket = useSocket();
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const notifications = useNotifications();

  useEffect(() => {
    if (socket) socket.emit('leaveRoom', 'left');

    async function init() {
        try {
          let boards = await accountService.getBoards()
          boards = boards.filter(board => board.creator)
          setBoards(boards)
        } catch (error) {
          const errorDescription = error.response.data.message;
          alert(errorDescription,'error',5000)
        }
      }
      init()
  }, [socket]);

  function handleChangeBoard(e) {
    const selectedBoard = boards.find(board => board._id === e.target.value)
    setCurrentBoard(selectedBoard)
  };

  function handleChange(e) {
    setCurrentBoard(prev => ({...prev, name: e.target.value}))
  };

  function handleCreate() {
    const NewBoard = {
        name: 'Unnamed Board',
        size: 15,
        bonusTiles: [
          { x: 0, y: 0, bonusType: 'tripleWord' },
          { x: 0, y: 7, bonusType: 'tripleWord' },
          { x: 0, y: 14, bonusType: 'tripleWord' },
          { x: 7, y: 0, bonusType: 'tripleWord' },
          { x: 7, y: 14, bonusType: 'tripleWord' },
          { x: 14, y: 0, bonusType: 'tripleWord' },
          { x: 14, y: 7, bonusType: 'tripleWord' },
          { x: 14, y: 14, bonusType: 'tripleWord' },
          { x: 1, y: 1, bonusType: 'doubleWord' },
          { x: 2, y: 2, bonusType: 'doubleWord' },
          { x: 3, y: 3, bonusType: 'doubleWord' },
          { x: 4, y: 4, bonusType: 'doubleWord' },
          { x: 7, y: 7, bonusType: 'doubleWord' },
          { x: 10, y: 10, bonusType: 'doubleWord' },
          { x: 11, y: 11, bonusType: 'doubleWord' },
          { x: 12, y: 12, bonusType: 'doubleWord' },
          { x: 13, y: 13, bonusType: 'doubleWord' },
          { x: 1, y: 13, bonusType: 'doubleWord' },
          { x: 2, y: 12, bonusType: 'doubleWord' },
          { x: 3, y: 11, bonusType: 'doubleWord' },
          { x: 4, y: 10, bonusType: 'doubleWord' },
          { x: 10, y: 4, bonusType: 'doubleWord' },
          { x: 11, y: 3, bonusType: 'doubleWord' },
          { x: 12, y: 2, bonusType: 'doubleWord' },
          { x: 13, y: 1, bonusType: 'doubleWord' },
          { x: 1, y: 5, bonusType: 'tripleLetter' },
          { x: 1, y: 9, bonusType: 'tripleLetter' },
          { x: 5, y: 1, bonusType: 'tripleLetter' },
          { x: 5, y: 5, bonusType: 'tripleLetter' },
          { x: 5, y: 9, bonusType: 'tripleLetter' },
          { x: 5, y: 13, bonusType: 'tripleLetter' },
          { x: 9, y: 1, bonusType: 'tripleLetter' },
          { x: 9, y: 5, bonusType: 'tripleLetter' },
          { x: 9, y: 9, bonusType: 'tripleLetter' },
          { x: 9, y: 13, bonusType: 'tripleLetter' },
          { x: 13, y: 5, bonusType: 'tripleLetter' },
          { x: 13, y: 9, bonusType: 'tripleLetter' },
          { x: 0, y: 3, bonusType: 'doubleLetter' },
          { x: 0, y: 11, bonusType: 'doubleLetter' },
          { x: 2, y: 6, bonusType: 'doubleLetter' },
          { x: 2, y: 8, bonusType: 'doubleLetter' },
          { x: 3, y: 0, bonusType: 'doubleLetter' },
          { x: 3, y: 7, bonusType: 'doubleLetter' },
          { x: 3, y: 14, bonusType: 'doubleLetter' },
          { x: 6, y: 2, bonusType: 'doubleLetter' },
          { x: 6, y: 6, bonusType: 'doubleLetter' },
          { x: 6, y: 8, bonusType: 'doubleLetter' },
          { x: 6, y: 12, bonusType: 'doubleLetter' },
          { x: 7, y: 3, bonusType: 'doubleLetter' },
          { x: 7, y: 11, bonusType: 'doubleLetter' },
          { x: 8, y: 2, bonusType: 'doubleLetter' },
          { x: 8, y: 6, bonusType: 'doubleLetter' },
          { x: 8, y: 8, bonusType: 'doubleLetter' },
          { x: 8, y: 12, bonusType: 'doubleLetter' },
          { x: 11, y: 0, bonusType: 'doubleLetter' },
          { x: 11, y: 7, bonusType: 'doubleLetter' },
          { x: 11, y: 14, bonusType: 'doubleLetter' },
          { x: 12, y: 6, bonusType: 'doubleLetter' },
          { x: 12, y: 8, bonusType: 'doubleLetter' },
          { x: 14, y: 3, bonusType: 'doubleLetter' },
          { x: 14, y: 11, bonusType: 'doubleLetter' }
        ]
    }
    setCurrentBoard(NewBoard)
  }

  async function handleSave() {
    if (currentBoard.creator) { // edit existing board
        try {
            const updatedBoard = await accountService.updateBoard(currentBoard)
            setBoards(prev => prev.map(board => board === currentBoard ? updatedBoard : board));
            notify('Successfully edited board!','success',5000)
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
    } else { // create new board
        try {
            const createdBoard = await accountService.createBoard(currentBoard)
            setBoards((prev)=> [...prev, createdBoard])
            notify('Successfully created board!','success',5000)
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
    }
  }

  async function handleDelete() {
    if (currentBoard.creator) { // delete existing board
        try {
            await accountService.deleteBoard(currentBoard._id)
            notify('Successfully deleted board!','success',5000)
            setBoards((prev) => prev.filter((board) => board._id !== currentBoard._id));
        } catch (error) {
            const errorDescription = error.response.data.message;
            notify(errorDescription,'error',5000)
        }
    }
    setCurrentBoard(null)
  }

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  return (
    <>
      <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', mt: 2}}>
        <GridOnIcon sx={{mr: 1}} />
        <Typography variant="h5">Board Editor</Typography>
      </Box>

      <Paper sx={{p: 2, width: 'fit-content', mx: 'auto', my: 2}}>
            <Select
                sx={{ width: 200, mx: 'auto', mb: 4, display: 'block' }} size="small"
                value={currentBoard?._id || ''}
                onChange={handleChangeBoard}
                >
                {boards.map(board => (
                    <MenuItem key={board._id} value={board._id}>{board.name}</MenuItem>
                ))}
            </Select>
            
            {currentBoard &&
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '50%', justifyContent: 'space-between'}}>
                <TextField label="Name" size="small" value={currentBoard?.name || ''} onChange={handleChange}/>
                
            </Box>}

        <Box sx={{mt: 3, mx: 'auto', width: 'fit-content'}}>
            {currentBoard ?
            <>
                <Button 
                    variant="contained" 
                    sx={{textTransform: 'none', mx: 1}}
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    >
                    Save Changes
                </Button>
                <Button 
                    variant="contained" 
                    sx={{textTransform: 'none', mx: 1}}
                    startIcon={<DeleteIcon />}
                    color='error'
                    onClick={handleDelete}
                    >
                    Delete Board
                </Button> 
            </> :
            <Button 
                variant="contained" 
                startIcon={<CreateIcon />} 
                onClick={handleCreate}
                sx={{textTransform: 'none'}}
                >
                Create Board
            </Button>}
        </Box>
        </Paper>
    </>
  );
}

export default BoardEditorPage;