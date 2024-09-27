import * as React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Avatar, Tooltip, MenuItem, Container, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ChairIcon from '@mui/icons-material/Chair';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import GridOnIcon from '@mui/icons-material/GridOn';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import HelpIcon from '@mui/icons-material/Help';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HistoryIcon from '@mui/icons-material/History';
import { Link as RouterLink } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

const unread_messages = []
const unread_notifications = []

function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const dropdownLinks = isLoggedIn ? [
    {text: 'Profile', route: '/profile', icon: <AccountCircle sx={{mr: 1}} />},
    {text: 'Rooms', route: '/rooms', icon: <ChairIcon sx={{mr: 1}} />},
    {text: 'Game History', route: '/games', icon: <HistoryIcon sx={{mr: 1}} />},
    {text: 'Board Editor', route: '/boardeditor', icon: <GridOnIcon sx={{mr: 1}} />},
    {text: 'Tile Bag Editor', route: '/tilebageditor', icon: <FontDownloadIcon sx={{mr: 1}} />},
    {text: 'Sign out', route: '/logout', icon: <LogoutIcon sx={{mr: 1}} />},
  ] : [
    {text: 'Sign in', route: '/login', icon: <LoginIcon sx={{mr: 1}} />},
  ]
  const navLinks = [
    {text: 'Rules', route: '/rules', icon: <HelpIcon sx={{mr: 1}}/>},
    {text: 'Dictionary', route: '/dictionary', icon: <AutoStoriesIcon sx={{mr: 1}}/>},
  ];

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
                <MenuItem 
                  key={link.text} 
                  component={RouterLink} 
                  to={link.route} 
                  onClick={handleCloseNavMenu}
                >
                  {link.icon}
                  <Typography sx={{ textAlign: 'center', textTransform: 'none' }}>{link.text}</Typography>
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
            <img alt='logo' src='logo.png' width={175}></img>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => (
              <MenuItem
                key={link.text}
                component={RouterLink}
                to={link.route}
                onClick={handleCloseNavMenu}
              >
                {link.icon}
                <Typography sx={{ textAlign: 'center', textTransform: 'none' }}>{link.text}</Typography>
              </MenuItem>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0 }}>

            {/*isLoggedIn && (
              <Tooltip title="Messages">
                <IconButton size="large" color="inherit">
                    <Badge badgeContent={unread_messages.length} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
              </Tooltip>
            )*/}

            {/*isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton size="large" color="inherit">
                    <Badge badgeContent={unread_notifications.length} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
              </Tooltip>
            )*/}
            
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
              disableScrollLock
            >
              {dropdownLinks.map((link) => (
                <MenuItem 
                  key={link.text} 
                  component={RouterLink} 
                  to={link.route} 
                  onClick={() => {handleCloseUserMenu(); if (link.text === 'Sign out') logOutUser()}}
                  sx={{color: link.text === 'Sign out' ? 'red' : 'black'}}
                >
                  {link.icon}
                  <Typography sx={{ textAlign: 'center' }}>{link.text}</Typography>
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
