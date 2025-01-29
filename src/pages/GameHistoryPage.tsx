import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography, 
  Paper, AvatarGroup, Avatar } from '@mui/material';
//import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import accountService from "../services/account.service";
import { Game } from '../types';
import useAuth from '../hooks/useAuth';

export default function GameHistoryPage() {
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [games, setGames] = useState([] as Game[]);
  const { user } = useAuth();

  useEffect(() => {
    async function init() {
      try {
        const games = await accountService.getGames()
        setGames(games)
      } catch (error) {
        console.error(error)
        alert('Failed to load game history')
      }
    }
    init()
  }, [])

  const headCells = [ 'Date','Score','Place','Players','Room','Host','Board', 'Tile Bag', 'Turn Duration', 'Rack Size', 'Mode']

  function descendingComparator(a: Game, b: Game, orderBy: string) {
    const value = (game: Game) => {
      switch (orderBy) {
        case 'Date': return game.createdAt;
        case 'Score': return game.players.find(player => player._id === user?._id)!.score;
        case 'Place': return game.players.indexOf(game.players.find(player => player._id === user?._id)!) + 1;
        case 'Players': return game.players.map(player => player._id).length;
        case 'Room': return game.room?.name;
        case 'Host': return game.host.name;
        case 'Board': return game.settings.board.name;
        case 'Tile Bag': return game.settings.tileBag.name;
        case 'Turn Duration': return game.settings.turnDuration;
        case 'Rack Size': return game.settings.rackSize;
        case 'Mode': return game.settings.gameEnd;
        default: return game.createdAt;
    }}
  
    if (value(b) < value(a)) {
      return -1;
    }
    if (value(b) > value(a)) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order: 'asc' | 'desc', orderBy: string) {
    return order === 'desc'
      ? (a: Game, b: Game) => descendingComparator(a, b, orderBy)
      : (a: Game, b: Game) => -descendingComparator(a, b, orderBy);
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - games.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...games]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, games],
  );

  interface Props {
    order: 'asc' | 'desc';
    orderBy: string;
    onRequestSort: (event: React.MouseEvent, property: string) => void;
  }

  function EnhancedTableHead({ order, orderBy, onRequestSort}: Props) {
    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell}
              align={'left'}
              padding={'normal'}
              sortDirection={orderBy === headCell ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell}
                direction={orderBy === headCell ? order : 'asc'}
                onClick={(event: React.MouseEvent) => onRequestSort(event, headCell)}
              >
                {headCell}
                {orderBy === headCell ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  return (
    <Box sx={{ width: '95%', mx: 'auto', mt: 2 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Typography
            sx={{ textAlign: 'center', py: 2}}
            variant="h5"
            id="tableTitle"
            >
          Game History
        </Typography>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={(_, property) => handleRequestSort(property)}
              rowCount={games.length}
            />
            <TableBody>
              {visibleRows.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row._id}
                  >
                    
                    <TableCell>{row.createdAt.slice(0,10)}</TableCell>
                    <TableCell>{row.players.find(player => player._id === user?._id)!.score}</TableCell>
                    <TableCell>{row.players.indexOf(row.players.find(player => player._id === user?._id)!) + 1}</TableCell>
                    <TableCell>
                      <AvatarGroup sx={{width: 'fit-content'}}>
                        {row.players.map(player => (
                          <Avatar key={player._id} alt='' src={player.profilePic} />
                        ))}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell sx={{color: !row.room?.name ? 'red' : 'black', fontStyle: !row.room?.name ? 'italic' : 'none'}}>
                      {row.room?.name || 'Deleted Room'}
                    </TableCell>
                    <TableCell>{row.host.name}</TableCell>
                    <TableCell>{row.settings.board.name}</TableCell>
                    <TableCell>{row.settings.tileBag.name}</TableCell>
                    <TableCell>{row.settings.turnDuration}</TableCell>
                    <TableCell>{row.settings.rackSize}</TableCell>
                    <TableCell sx={{textTransform: 'capitalize'}}>{row.settings.gameEnd}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={games.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => handleChangePage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}