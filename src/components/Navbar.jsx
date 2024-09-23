import * as React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Avatar, Button, Tooltip, MenuItem, Container, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ChairIcon from '@mui/icons-material/Chair';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import GridOnIcon from '@mui/icons-material/GridOn';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

const navLinks = ['Rules', 'Dictionary'];
const routes = {
    'nav': '/nav',
};
const unread_messages = []
const unread_notifications = []

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));
  
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  }));

function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const DropdownLinks = isLoggedIn ? [
    {text: 'Profile', route: '/profile', icon: <AccountCircle sx={{mr: 1}} />},
    {text: 'Rooms', route: '/rooms', icon: <ChairIcon sx={{mr: 1}} />},
    {text: 'Board Editor', route: '/boardeditor', icon: <GridOnIcon sx={{mr: 1}} />},
    {text: 'Tile Bag Editor', route: '/tilebageditor', icon: <FontDownloadIcon sx={{mr: 1}} />},
    {text: 'Sign out', route: '/logout', icon: <LogoutIcon sx={{mr: 1}} />},
  ] : [
    {text: 'Sign in', route: '/login', icon: <LoginIcon sx={{mr: 1}} />},
  ]

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" sx={{bgcolor: '#175c36'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <img alt='logo' src='logo.png' width={200}></img>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navLinks.map((link) => (
                <MenuItem key={link} component={RouterLink} to={routes[link]} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: 'center', textTransform: 'none' }}>{link}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
            }}
          >
            <img alt='logo' src='logo.png' width={200}></img>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => (
              <Button
                key={link}
                component={RouterLink}
                to={routes[link]}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none' }}
              >
                {link}
              </Button>
            ))}
          </Box>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && (
              <Tooltip title="Messages">
                <IconButton size="large" aria-label="show new mails" color="inherit">
                    <Badge badgeContent={unread_messages.length} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
              </Tooltip>
            )}

            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                    size="large"
                    aria-label="show new notifications"
                    color="inherit"
                    >
                    <Badge badgeContent={unread_notifications.length} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={isLoggedIn ? user.name: "Guest"}>
            {isLoggedIn ? (
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src={user.profilePic || "/broken-image.jpg"} />
              </IconButton>
            ) : (
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    //aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleOpenUserMenu}
                    color="inherit"
                    >
                        <AccountCircle />
                </IconButton>
            )}
            </Tooltip>

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {DropdownLinks.map((link, index) => (
                <MenuItem 
                  key={DropdownLinks[index].text} 
                  component={RouterLink} 
                  to={DropdownLinks[index].route} 
                  onClick={() => {handleCloseUserMenu(); if (DropdownLinks[index].text === 'Sign out') logOutUser()}}
                  sx={{color: DropdownLinks[index].text === 'Sign out' ? 'red' : 'black'}}
                >
                  {DropdownLinks[index].icon}
                  <Typography sx={{ textAlign: 'center' }}>{DropdownLinks[index].text}</Typography>
                </MenuItem>
              ))}
            </Menu>

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
