import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import NameIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/AlternateEmail';
import GenderIcon from '@mui/icons-material/Wc';
import CountryIcon from '@mui/icons-material/Home';
import BirthdateIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import accountService from "../services/account.service";

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

function ProfilePage() {
  const [initValues, setInitValues] = useState(null)
  const fields = ['name', 'email', 'gender', 'country', 'birthdate']
  const icons = [<NameIcon />,<EmailIcon />,<GenderIcon />,<CountryIcon />,<BirthdateIcon />]

  useEffect(() => {
    async function init() {
      try {
        const profile = await accountService.getProfile()
        setInitValues(profile)
      } catch (error) {
        const errorDescription = error.response.data.message;
        alert(errorDescription);
      }
    }
    init()
  }, [])

  return (
    <Paper elevation={3} sx={{ width: '50dvw', height: '80dvh', mx: 'auto'}}>
      <Typography sx={{ mt: 4, mb: 2, mx: 'auto', width: 'fit-content', pt: 2 }} variant="h5" component="div">
          My Profile
      </Typography>
    <Box sx={{ maxWidth: '30dvw', mx: 'auto' }}>
        <Grid item xs={12} md={6}>
          <Demo>
            <List dense={false}>
              {fields.map(field =>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="edit">
                      <Tooltip title="Edit">
                        <EditIcon />
                      </Tooltip>
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {icons[fields.indexOf(field)]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={initValues ? initValues[field] : ''}
                    secondary={null}
                  />
                </ListItem>,
              )}
            </List>
          </Demo>
        </Grid>
    </Box>
    </Paper >
  );
}

export default ProfilePage;
