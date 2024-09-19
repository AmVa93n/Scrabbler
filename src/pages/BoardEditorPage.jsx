import { useSocket } from '../context/socket.context';
import { useEffect, useState } from 'react';
import accountService from "../services/account.service";
import GridOnIcon from '@mui/icons-material/GridOn';
import { Button, Select, MenuItem, Typography, Box, Paper, TextField, Grid2, Stack, InputLabel, FormControl } from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import SaveIcon from '@mui/icons-material/Save';
import CreateIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import BrushIcon from '@mui/icons-material/Brush';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

function BoardEditorPage() {
  const socket = useSocket();
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const notifications = useNotifications();
  const [currentTileDraw, setCurrentBonusDraw] = useState(null);

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
    const field = e.target.name
    setCurrentBoard(prev => ({...prev, [field]: e.target.value}))
  };

  function handleCreate() {
    const NewBoard = {
        name: 'Unnamed Board',
        size: 15,
        bonusTiles: []
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
            setCurrentBoard(createdBoard)
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

  function createBoard() {
    const { size, bonusTiles } = currentBoard
    const boardDisplay = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => ({
          x: col,
          y: row,
          bonusType: bonusTiles.find(bonusTile => bonusTile.x === col && bonusTile.y === row)?.bonusType
      }))
    )
    return boardDisplay
  }

  function getTileColor(bonus) {
    switch(bonus) {
      case 'quadrupleWord': return '#CC0000'
      case 'tripleWord': return '#FF3333'
      case 'doubleWord': return '#FF9999'
      case 'quadrupleLetter': return '#0066CC'
      case 'tripleLetter': return '#3399FF'
      case 'doubleLetter': return '#99CCFF'
      default: return '#F5DEB3'
    }
  }

  const tileTypes = [
    { value: '', name: 'No Bonus' },
    { value: 'doubleLetter', name: 'Double Letter' },
    { value: 'tripleLetter', name: 'Triple Letter' },
    { value: 'quadrupleLetter', name: 'Quadruple Letter' },
    { value: 'doubleWord', name: 'Double Word' },
    { value: 'tripleWord', name: 'Triple Word' },
    { value: 'quadrupleWord', name: 'Quadruple Word' },
  ];

  function handlePickBonus(value) {
    const color = getTileColor(value);
    setCurrentBonusDraw({ value, color });
  };

  function handleDrawTile(x, y) {
    if (!currentTileDraw) return
    setCurrentBoard(prev => {
      // Create the new bonusTile object with the x, y coordinates and the bonusType from currentBonusDraw
      const newBonusTile = { x, y, bonusType: currentTileDraw.value };

      // Check if the tile already exists in the bonusTiles array
      const updatedBonusTiles = prev.bonusTiles.map(tile => 
        tile.x === x && tile.y === y 
          ? { ...tile, bonusType: currentTileDraw.value } // Update existing tile
          : tile // Keep existing tile
      );

      // If the tile was not updated, add the newBonusTile
      const isExistingTile = prev.bonusTiles.some(tile => tile.x === x && tile.y === y);
      if (!isExistingTile) {
        updatedBonusTiles.push(newBonusTile);
      }

      // Return the updated state with the new bonusTiles array
      return { ...prev, bonusTiles: updatedBonusTiles };
    });
  }

  function handleDefaultLayout() {
    const default15x15 = [
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
    const default21x21 = [
      { x: 0, y: 0, bonusType: 'quadrupleWord' },
      { x: 0, y: 20, bonusType: 'quadrupleWord' },
      { x: 20, y: 0, bonusType: 'quadrupleWord' },
      { x: 20, y: 20, bonusType: 'quadrupleWord' },

      { x: 3, y: 3, bonusType: 'tripleWord' },
      { x: 3, y: 10, bonusType: 'tripleWord' },
      { x: 3, y: 17, bonusType: 'tripleWord' },
      { x: 10, y: 3, bonusType: 'tripleWord' },
      { x: 10, y: 17, bonusType: 'tripleWord' },
      { x: 17, y: 3, bonusType: 'tripleWord' },
      { x: 17, y: 10, bonusType: 'tripleWord' },
      { x: 17, y: 17, bonusType: 'tripleWord' },
      { x: 0, y: 7, bonusType: 'tripleWord' },
      { x: 0, y: 13, bonusType: 'tripleWord' },
      { x: 7, y: 0, bonusType: 'tripleWord' },
      { x: 13, y: 0, bonusType: 'tripleWord' },
      { x: 20, y: 7, bonusType: 'tripleWord' },
      { x: 20, y: 13, bonusType: 'tripleWord' },
      { x: 7, y: 20, bonusType: 'tripleWord' },
      { x: 13, y: 20, bonusType: 'tripleWord' },

      { x: 1, y: 1, bonusType: 'doubleWord' },
      { x: 2, y: 2, bonusType: 'doubleWord' },
      { x: 4, y: 4, bonusType: 'doubleWord' },
      { x: 5, y: 5, bonusType: 'doubleWord' },
      { x: 6, y: 6, bonusType: 'doubleWord' },
      { x: 7, y: 7, bonusType: 'doubleWord' },
      { x: 10, y: 10, bonusType: 'doubleWord' },
      { x: 13, y: 13, bonusType: 'doubleWord' },
      { x: 14, y: 14, bonusType: 'doubleWord' },
      { x: 15, y: 15, bonusType: 'doubleWord' },
      { x: 16, y: 16, bonusType: 'doubleWord' },
      { x: 18, y: 18, bonusType: 'doubleWord' },
      { x: 19, y: 19, bonusType: 'doubleWord' },
      { x: 1, y: 19, bonusType: 'doubleWord' },
      { x: 2, y: 18, bonusType: 'doubleWord' },
      { x: 4, y: 16, bonusType: 'doubleWord' },
      { x: 5, y: 15, bonusType: 'doubleWord' },
      { x: 6, y: 14, bonusType: 'doubleWord' },
      { x: 7, y: 13, bonusType: 'doubleWord' },
      { x: 13, y: 7, bonusType: 'doubleWord' },
      { x: 14, y: 6, bonusType: 'doubleWord' },
      { x: 15, y: 5, bonusType: 'doubleWord' },
      { x: 16, y: 4, bonusType: 'doubleWord' },
      { x: 18, y: 2, bonusType: 'doubleWord' },
      { x: 19, y: 1, bonusType: 'doubleWord' },
      { x: 8, y: 1, bonusType: 'doubleWord' },
      { x: 12, y: 1, bonusType: 'doubleWord' },
      { x: 9, y: 2, bonusType: 'doubleWord' },
      { x: 11, y: 2, bonusType: 'doubleWord' },
      { x: 18, y: 9, bonusType: 'doubleWord' },
      { x: 18, y: 11, bonusType: 'doubleWord' },
      { x: 19, y: 8, bonusType: 'doubleWord' },
      { x: 19, y: 12, bonusType: 'doubleWord' },
      { x: 9, y: 18, bonusType: 'doubleWord' },
      { x: 11, y: 18, bonusType: 'doubleWord' },
      { x: 8, y: 19, bonusType: 'doubleWord' },
      { x: 12, y: 19, bonusType: 'doubleWord' },
      { x: 2, y: 9, bonusType: 'doubleWord' },
      { x: 2, y: 11, bonusType: 'doubleWord' },
      { x: 1, y: 8, bonusType: 'doubleWord' },
      { x: 1, y: 12, bonusType: 'doubleWord' },

      { x: 2, y: 5, bonusType: 'quadrupleLetter' },
      { x: 5, y: 2, bonusType: 'quadrupleLetter' },
      { x: 2, y: 15, bonusType: 'quadrupleLetter' },
      { x: 5, y: 18, bonusType: 'quadrupleLetter' },
      { x: 15, y: 2, bonusType: 'quadrupleLetter' },
      { x: 18, y: 5, bonusType: 'quadrupleLetter' },
      { x: 18, y: 15, bonusType: 'quadrupleLetter' },
      { x: 15, y: 18, bonusType: 'quadrupleLetter' },

      { x: 4, y: 8, bonusType: 'tripleLetter' },
      { x: 4, y: 12, bonusType: 'tripleLetter' },
      { x: 8, y: 4, bonusType: 'tripleLetter' },
      { x: 8, y: 8, bonusType: 'tripleLetter' },
      { x: 8, y: 12, bonusType: 'tripleLetter' },
      { x: 8, y: 16, bonusType: 'tripleLetter' },
      { x: 12, y: 4, bonusType: 'tripleLetter' },
      { x: 12, y: 8, bonusType: 'tripleLetter' },
      { x: 12, y: 12, bonusType: 'tripleLetter' },
      { x: 12, y: 16, bonusType: 'tripleLetter' },
      { x: 16, y: 8, bonusType: 'tripleLetter' },
      { x: 16, y: 12, bonusType: 'tripleLetter' },
      { x: 1, y: 4, bonusType: 'tripleLetter' },
      { x: 4, y: 1, bonusType: 'tripleLetter' },
      { x: 16, y: 1, bonusType: 'tripleLetter' },
      { x: 19, y: 4, bonusType: 'tripleLetter' },
      { x: 19, y: 16, bonusType: 'tripleLetter' },
      { x: 16, y: 19, bonusType: 'tripleLetter' },
      { x: 4, y: 19, bonusType: 'tripleLetter' },
      { x: 1, y: 16, bonusType: 'tripleLetter' },

      { x: 3, y: 6, bonusType: 'doubleLetter' },
      { x: 3, y: 14, bonusType: 'doubleLetter' },
      { x: 5, y: 9, bonusType: 'doubleLetter' },
      { x: 5, y: 11, bonusType: 'doubleLetter' },
      { x: 6, y: 3, bonusType: 'doubleLetter' },
      { x: 6, y: 10, bonusType: 'doubleLetter' },
      { x: 6, y: 17, bonusType: 'doubleLetter' },
      { x: 9, y: 5, bonusType: 'doubleLetter' },
      { x: 9, y: 9, bonusType: 'doubleLetter' },
      { x: 9, y: 11, bonusType: 'doubleLetter' },
      { x: 9, y: 15, bonusType: 'doubleLetter' },
      { x: 10, y: 6, bonusType: 'doubleLetter' },
      { x: 10, y: 14, bonusType: 'doubleLetter' },
      { x: 11, y: 5, bonusType: 'doubleLetter' },
      { x: 11, y: 9, bonusType: 'doubleLetter' },
      { x: 11, y: 11, bonusType: 'doubleLetter' },
      { x: 11, y: 15, bonusType: 'doubleLetter' },
      { x: 14, y: 3, bonusType: 'doubleLetter' },
      { x: 14, y: 10, bonusType: 'doubleLetter' },
      { x: 14, y: 17, bonusType: 'doubleLetter' },
      { x: 15, y: 9, bonusType: 'doubleLetter' },
      { x: 15, y: 11, bonusType: 'doubleLetter' },
      { x: 17, y: 6, bonusType: 'doubleLetter' },
      { x: 17, y: 14, bonusType: 'doubleLetter' },
      { x: 0, y: 10, bonusType: 'doubleLetter' },
      { x: 10, y: 0, bonusType: 'doubleLetter' },
      { x: 10, y: 20, bonusType: 'doubleLetter' },
      { x: 20, y: 10, bonusType: 'doubleLetter' },
      { x: 0, y: 3, bonusType: 'doubleLetter' },
      { x: 3, y: 0, bonusType: 'doubleLetter' },
      { x: 0, y: 17, bonusType: 'doubleLetter' },
      { x: 3, y: 20, bonusType: 'doubleLetter' },
      { x: 17, y: 0, bonusType: 'doubleLetter' },
      { x: 20, y: 3, bonusType: 'doubleLetter' },
      { x: 20, y: 17, bonusType: 'doubleLetter' },
      { x: 17, y: 20, bonusType: 'doubleLetter' },
  ]
    const layout = currentBoard.size === 15 ? default15x15 : default21x21
    setCurrentBoard(prev=> ({...prev, bonusTiles: layout}))
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
            <>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '50%', justifyContent: 'space-between'}}>
                <TextField name="name" label="Name" size="small" value={currentBoard?.name || ''} onChange={handleChange}/>
                <FormControl size="small">
                  <InputLabel id="size">Size</InputLabel>
                  <Select name="size"
                    labelId='size'
                    label='Size'
                    sx={{ width: 200 }} 
                    value={currentBoard?.size || ''}
                    onChange={handleChange}
                    >
                      <MenuItem value={15}>15x15</MenuItem>
                      <MenuItem value={17}>17x17</MenuItem>
                      <MenuItem value={19}>19x19</MenuItem>
                      <MenuItem value={21}>21x21</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Stack direction='row'>
              <Stack direction='column' sx={{mr: 1}}>
              <Typography variant="body2" sx={{mb: 1}}>Choose a tile to draw:</Typography>
              <Box display="flex" flexDirection="column" sx={{border: 'solid 1px', width: 'fit-content'}}>
                {tileTypes.map((bonus) => (
                  <Box
                    key={bonus.value}
                    width={145}
                    height={30}
                    display="flex"
                    alignItems="center"
                    bgcolor={getTileColor(bonus.value)}
                    onClick={() => handlePickBonus(bonus.value)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2" sx={{pl: 1}}>
                      {bonus.name}
                    </Typography>
                    {currentTileDraw?.value === bonus.value && <BrushIcon sx={{ml: 'auto'}} />}
                  </Box>
                ))}
              </Box>
              <Button 
                sx={{textTransform: 'none', backgroundColor: 'grey', mt: 3}}
                variant="contained" 
                startIcon={<CancelIcon />} 
                onClick={()=> setCurrentBoard(prev=> ({...prev, bonusTiles: []}))}
              >
                Clear Board
              </Button>
              <Button 
                sx={{textTransform: 'none', backgroundColor: 'grey', mt: 1}}
                variant="contained" 
                startIcon={<AutoFixHighIcon />} 
                disabled={[17,19].includes(currentBoard.size)}
                onClick={handleDefaultLayout}
              >
                Default Layout
              </Button>
              </Stack>
             
              <Grid2 
                  container 
                  columns={currentBoard.size}
                  justifyContent="center"
                  sx={{
                      width: 600,
                      aspectRatio: '1 / 1',
                      border: 'solid 3px brown',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                  }}
                  >
                {createBoard().map((row, rowIndex) =>
                  row.map((tile, colIndex) => (
                          <Grid2 
                              item
                              key={`${rowIndex}-${colIndex}`}
                              sx={{
                                  width: `calc(100% / ${currentBoard.size})`, // Set width based on number of columns
                                  height: `calc(100% / ${currentBoard.size})`, // Set height based on number of rows
                              }}
                              >
                                  <Box
                                    onClick={()=> handleDrawTile(colIndex, rowIndex)}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: getTileColor(tile.bonusType),
                                      border: 'solid 1px white',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      cursor: currentTileDraw ? 'pointer' : 'default'
                                    }}
                                  >
                                    {(rowIndex === currentBoard.size/2-0.5 && colIndex === currentBoard.size/2-0.5) && 
                                      (<Typography variant="h4">★</Typography>)}
                                  </Box>
                          </Grid2>
                      )
                  )
                )}
              </Grid2>
            </Stack>
              </>}

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