import useSocket from '../hooks/useSocket';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { Board } from '../types';
import useAuth from '../hooks/useAuth';
import { SelectChangeEvent } from '@mui/material/Select';

function BoardEditorPage() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [boards, setBoards] = useState([] as Board[])
  const [editedBoard, setEditedBoard] = useState<Board | null>(null);
  const notifications = useNotifications();
  const [currentBonusDraw, setCurrentBonusDraw] = useState<{ value: string; color: string } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (socket) socket.emit('leaveRoom', 'left');

    async function init() {
        try {
          const boards = await accountService.getBoards()
          const boardsByUser = boards.filter((board: Board) => board.creator)
          setBoards(boardsByUser)
        } catch (error) {
          console.log(error)
          alert('Error loading boards')
        }
      }
      init()
  }, [socket]);

  useEffect(() => {
    // Add global mouse down and mouse up event listeners
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  function handleChangeBoard(e: SelectChangeEvent) {
    const selectedBoard = boards.find(board => board._id === e.target.value)!
    setEditedBoard(selectedBoard)
  };

  function handleChange(e: SelectChangeEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = e.target.name
    setEditedBoard(prev => prev && ({...prev, [field]: e.target.value}))
  };

  async function handleCreate() {
    const NewBoard = {
        name: 'Unnamed Board',
        size: 15,
        bonusSquares: [],
        creator: user!._id
    } as Omit<Board, '_id'>
    try {
      const createdBoard = await accountService.createBoard(NewBoard)
      setBoards((prev)=> [...prev, createdBoard])
      notifications.show('Successfully created board!', { severity: 'success', autoHideDuration: 5000 });
      setEditedBoard(createdBoard)
    } catch (error) {
      console.error(error)
      notifications.show("Error creating board", { severity: 'error', autoHideDuration: 5000 });
    }
  }

  async function handleSave() {
    if (!editedBoard) return
    try {
        const updatedBoard = await accountService.updateBoard(editedBoard)
        setBoards(prev => prev.map(board => board._id === editedBoard._id ? updatedBoard : board));
        notifications.show('Successfully saved changes to board!', { severity: 'success', autoHideDuration: 5000 });
        setEditedBoard(null)
    } catch (error) {
        console.error(error)
        notifications.show("Error editing board", { severity: 'error', autoHideDuration: 5000 });
    }
  }

  async function handleDelete() {
    if (!editedBoard) return
    try {
        await accountService.deleteBoard(editedBoard._id)
        setBoards((prev) => prev.filter((board) => board._id !== editedBoard._id));
        notifications.show('Successfully deleted board!', { severity: 'success', autoHideDuration: 5000 });
        setEditedBoard(null)
    } catch (error) {
        console.error(error)
        notifications.show("Error deleting board", { severity: 'error', autoHideDuration: 5000 });
    }
  }

  function createBoard() {
    if (!editedBoard) return
    const { size, bonusSquares } = editedBoard
    const boardDisplay = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => ({
          x: col,
          y: row,
          bonusType: bonusSquares.find(square => square.x === col && square.y === row)?.bonusType
      }))
    )
    return boardDisplay
  }

  function getSquareColor(bonus: string | undefined) {
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

  const squareTypes = [
    { value: '', name: 'No Bonus' },
    { value: 'doubleLetter', name: 'Double Letter' },
    { value: 'tripleLetter', name: 'Triple Letter' },
    { value: 'quadrupleLetter', name: 'Quadruple Letter' },
    { value: 'doubleWord', name: 'Double Word' },
    { value: 'tripleWord', name: 'Triple Word' },
    { value: 'quadrupleWord', name: 'Quadruple Word' },
  ];

  function handlePickBonus(value: string) {
    const color = getSquareColor(value);
    setCurrentBonusDraw({ value, color });
  };

  function handleDrawSquare(e: React.MouseEvent<HTMLDivElement>, x: number, y: number) {
    if (!currentBonusDraw) return
    e.preventDefault()
    setEditedBoard(prev => {
      if (!prev) return null
      // Create the new BonusSquare object with the x, y coordinates and the bonusType from currentBonusDraw
      const newBonusSquare = { x, y, bonusType: currentBonusDraw.value };

      // Check if the square already exists in the array
      const updatedBonusSquares = prev.bonusSquares.map(square => 
        square.x === x && square.y === y 
          ? { ...square, bonusType: currentBonusDraw.value } // Update existing square
          : square // Keep existing square
      );

      // If the square was not updated, add the newBonusSquare
      const isExistingSquare = prev.bonusSquares.some(square => square.x === x && square.y === y);
      if (!isExistingSquare) {
        updatedBonusSquares.push(newBonusSquare);
      }

      // Return the updated state with the new array
      return { ...prev, bonusSquares: updatedBonusSquares };
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
    const layout = editedBoard?.size === 15 ? default15x15 : default21x21
    setEditedBoard(prev=> prev && ({...prev, bonusSquares: layout}))
  }

  return (
    <Paper sx={{p: 2, width: 'fit-content', mx: 'auto', my: 2}}>
        <Box sx={{display: 'flex', mx: 'auto', alignItems: 'center', width: 'fit-content', pb: 2}}>
          <GridOnIcon sx={{mr: 1}} />
          <Typography variant="h5">Board Editor</Typography>
        </Box>
        
            <Select
                sx={{ width: 200, mx: 'auto', mb: 4, display: 'block' }} size="small"
                value={!editedBoard ? '' : (editedBoard as Board)._id}
                onChange={handleChangeBoard}
                MenuProps={{disableScrollLock: true}}
                >
                {boards.map(board => (
                    <MenuItem key={board._id} value={board._id}>{board.name}</MenuItem>
                ))}
            </Select>
            
            {editedBoard &&
            <>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, mx: 'auto', width: '55%', justifyContent: 'space-between'}}>
                <TextField name="name" label="Name" size="small" value={editedBoard?.name || ''} onChange={handleChange}/>
                <FormControl size="small">
                  <InputLabel id="size">Size</InputLabel>
                  <Select name="size"
                    labelId='size'
                    label='Size'
                    sx={{ width: 200 }} 
                    value={String(editedBoard?.size) || ''}
                    onChange={handleChange}
                    MenuProps={{disableScrollLock: true}}
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
              <Typography variant="body2" sx={{mb: 1}}>Choose a square type to draw:</Typography>
              <Box display="flex" flexDirection="column" sx={{border: 'solid 1px', width: 'fit-content'}}>
                {squareTypes.map((bonus) => (
                  <Box
                    key={bonus.value}
                    width={145}
                    height={30}
                    display="flex"
                    alignItems="center"
                    bgcolor={getSquareColor(bonus.value)}
                    onClick={() => handlePickBonus(bonus.value)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2" sx={{pl: 1}}>
                      {bonus.name}
                    </Typography>
                    {currentBonusDraw?.value === bonus.value && <BrushIcon sx={{ml: 'auto'}} />}
                  </Box>
                ))}
              </Box>
              <Button 
                sx={{textTransform: 'none', backgroundColor: 'grey', mt: 3}}
                variant="contained" 
                startIcon={<CancelIcon />} 
                onClick={()=> setEditedBoard(prev=> prev && ({...prev, bonusSquares: []}))}
              >
                Clear Board
              </Button>
              <Button 
                sx={{textTransform: 'none', backgroundColor: 'grey', mt: 1}}
                variant="contained" 
                startIcon={<AutoFixHighIcon />} 
                disabled={[17,19].includes(editedBoard.size)}
                onClick={handleDefaultLayout}
              >
                Default Layout
              </Button>
              </Stack>
             
              <Grid2 
                  container 
                  columns={editedBoard.size}
                  justifyContent="center"
                  sx={{
                      width: 600,
                      aspectRatio: '1 / 1',
                      border: 'solid 3px brown',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                  }}
                  >
                {createBoard()?.map((row, rowIndex) =>
                  row.map((square, colIndex) => (
                          <Grid2 
                              key={`${rowIndex}-${colIndex}`}
                              sx={{
                                  width: `calc(100% / ${editedBoard.size})`, // Set width based on number of columns
                                  height: `calc(100% / ${editedBoard.size})`, // Set height based on number of rows
                              }}
                              >
                                  <Box
                                    onClick={(e)=> handleDrawSquare(e, colIndex, rowIndex)}
                                    onMouseOver={(e) => isMouseDown && handleDrawSquare(e, colIndex, rowIndex)}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: getSquareColor(square.bonusType),
                                      border: 'solid 1px white',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      cursor: currentBonusDraw ? 'pointer' : 'default',
                                      userSelect: isMouseDown ? 'none' : 'default'
                                    }}
                                  >
                                    {(rowIndex === editedBoard.size/2-0.5 && colIndex === editedBoard.size/2-0.5) && 
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
            {editedBoard ?
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
  );
}

export default BoardEditorPage;