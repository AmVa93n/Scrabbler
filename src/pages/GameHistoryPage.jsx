import { useState, useEffect, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography, 
  Paper, AvatarGroup, Avatar } from '@mui/material';
//import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import accountService from "../services/account.service";
import { AuthContext } from "../context/auth.context";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function GameHistoryPage() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [games, setGames] = useState([]);
  const User = useContext(AuthContext).user;

  useEffect(() => {
    async function init() {
      try {
        const data = await accountService.getGames()
        const games = createRows(data)
        setGames(games)
      } catch (error) {
        const errorDescription = error.response?.data.message;
        alert(errorDescription)
      }
    }
    init()
  }, [])

  function createRows(gameData) {
    const games = []
    for (let game of gameData) {
        const { _id, room, host, settings, createdAt, players } = game
        const { board, tileBag, turnDuration, rackSize, gameEnd } = settings
        const player = players.find(player => player._id === User._id)
        const place = players.indexOf(player) + 1
        games.push({ 
            gameId: _id, 
            'Date': createdAt.slice(0,10),
            'Score': player.score || 0,
            'Place': place,
            'Players': players,
            'Room': room?.name,
            'Host': host.name,
            'Board': board.name, 
            'Tile Bag': tileBag.name, 
            'Turn Duration': turnDuration, 
            'Rack Size': rackSize, 
            'Mode': gameEnd,
          })
    }
    return games
  }

  const headCells = [ 
    'Date',
    'Score',
    'Place',
    'Players',
    'Room',
    'Host',
    'Board', 
    'Tile Bag', 
    'Turn Duration', 
    'Rack Size', 
    'Mode',
  ]

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
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

  function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell}
              align={'left'}
              padding={'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell}
                {orderBy === headCell.id ? (
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
              onRequestSort={handleRequestSort}
              rowCount={games.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.gameId}
                  >
                    
                    <TableCell>{row.Date}</TableCell>
                    <TableCell>{row.Score}</TableCell>
                    <TableCell>{row.Place}</TableCell>
                    <TableCell>
                      <AvatarGroup sx={{width: 'fit-content'}}>
                        {row.Players.map(player => (
                          <Avatar key={player._id} alt='' src={player.profilePic} />
                        ))}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell sx={{color: !row.Room ? 'red' : 'black', fontStyle: !row.Room ? 'italic' : 'none'}}>
                      {row.Room || 'Deleted Room'}
                    </TableCell>
                    <TableCell>{row.Host}</TableCell>
                    <TableCell>{row.Board}</TableCell>
                    <TableCell>{row['Tile Bag']}</TableCell>
                    <TableCell>{row['Turn Duration']}</TableCell>
                    <TableCell>{row['Rack Size']}</TableCell>
                    <TableCell sx={{textTransform: 'capitalize'}}>{row.Mode}</TableCell>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}