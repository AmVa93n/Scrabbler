import { useEffect, useState, useRef } from 'react';
import { TextField, IconButton, ListItem, ListItemAvatar, ListItemText, Avatar, RadioGroup, Radio, Badge, Box, List, Tooltip, Paper,
          FormControlLabel} from '@mui/material';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import NameIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/AlternateEmail';
import GenderIcon from '@mui/icons-material/Wc';
import CountryIcon from '@mui/icons-material/Home';
import BirthdateIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CountrySelect from '../components/CountrySelect';
import accountService from "../services/account.service";
import { useNotifications } from '@toolpad/core/useNotifications';
import { blue } from '@mui/material/colors';

function ProfilePage() {
  const [fieldValues, setFieldValues] = useState(null)
  const [editMode, setEditMode] = useState({}); // Manage edit state for each field
  const [inputValues, setInputValues] = useState({});
  const fields = ['name', 'email', 'gender', 'birthdate', 'country']
  const icons = [<NameIcon />,<EmailIcon />,<GenderIcon />,<BirthdateIcon />,<CountryIcon />,]
  const notifications = useNotifications();
  const [pfpPreview, setPfpPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const profile = await accountService.getProfile()
        setFieldValues(profile)
        setPfpPreview(profile.profilePic)
      } catch (error) {
        const errorDescription = error.response.data.message;
        alert(errorDescription)
      }
    }
    init()
  }, [])

  function handleEdit(field) {
    setEditMode((prev) => ({ ...prev, [field]: true })); // Turn on edit mode
    setInputValues((prev) => ({ ...prev, [field]: fieldValues[field] }));
    if (fileInputRef.current && field === "profilePic") {
      fileInputRef.current.click(); // Trigger the click on hidden input
    }
  };

  function handleInputChange(field, value) {
    setInputValues((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave(field) {
    try {
      const formData = new FormData();
      if (field === 'birthdate') {
        formData.append('birthdate', inputValues.birthdate.startOf('day').format('YYYY-MM-DD'));
      } else if (field === 'country') {
        formData.append('country', inputValues.country.label);
      } else if (field === 'profilePic') {
        formData.append('profilePic', inputValues.profilePic);
      } else {
        formData.append(field, inputValues[field]);
      }
      console.log(inputValues['profilePic'])
      await accountService.updateProfile(formData); // Save updated field to the server
      if (field === 'birthdate') setFieldValues((prev) => ({ ...prev, birthdate: inputValues.birthdate.startOf('day').format('YYYY-MM-DD')}));
      else if (field === 'country') setFieldValues((prev) => ({ ...prev, country: inputValues.country.label}));
      else setFieldValues((prev) => ({ ...prev, [field]: inputValues[field] }));
      notify('Profile updated','success',5000)
    } catch (error) {
      const errorDescription = error.response.data.message;
      notify(errorDescription,'error',5000)
    }
    setEditMode((prev) => ({ ...prev, [field]: false })); // Turn off edit mode
  };

  function handleCancel(field) {
    setInputValues((prev) => ({ ...prev, [field]: fieldValues[field] })); // Revert to the original value
    setEditMode((prev) => ({ ...prev, [field]: false }));          // Turn off edit mode
  };

  function notify(message, type, duration) {
    notifications.show(message, {
      severity: type,
      autoHideDuration: duration,
    });
  }

  function handleFilePreview(event) {
    const reader = new FileReader();
    reader.onload = function(){
      setPfpPreview(reader.result)
      setInputValues((prev) => ({ ...prev, profilePic: event.target.files[0] }));
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  return (
    <Paper elevation={3} sx={{ width: 'fit-content', px: 1, mx: 'auto', mt: 2}}>
      <Typography sx={{pb: 2, mx: 'auto', width: 'fit-content', pt: 2 }} variant="h5" component="div">
          My Profile
      </Typography>

      <Badge
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        badgeContent={
          <Tooltip title={editMode.profilePic ? "Save" : "Edit"}>
            <IconButton edge="end" aria-label="edit" sx={{ bgcolor: 'lightgrey' }}
              onClick={() => editMode.profilePic ? handleSave('profilePic') : handleEdit('profilePic')}>
                {editMode.profilePic ? <SaveIcon /> : <EditIcon />}
                <input
                  type="file"
                  ref={fileInputRef} // Attach the ref to the hidden input
                  style={{ display: 'none' }} // Hide the input
                  onChange={handleFilePreview} // Handle the file selection
                  name='profilePic'
                />
            </IconButton>
          </Tooltip>
        }
        sx={{mx: "auto", width: 'fit-content', display: 'block'}}
        >
        <Avatar src={pfpPreview} sx={{mx: "auto", width: '12rem', height: '12rem', mb: '1rem'}} />
      </Badge>

      <List dense={false}>
        {fields.map(field =>
          <ListItem key={field}>

            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[500] }}>
                {icons[fields.indexOf(field)]}
              </Avatar>
            </ListItemAvatar>

            {editMode[field] ? (
              field === 'gender' ? (
                <RadioGroup
                  defaultValue={inputValues[field]}
                  name="gender"
                  row
                  onChange={(e) => handleInputChange(field, e.target.value)}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              ) : field === 'birthdate' ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={dayjs(inputValues[field])}
                    onChange={(newValue) => handleInputChange(field, newValue)}
                  />
                </LocalizationProvider>
              ) : field === 'country' ? (
                <CountrySelect
                  value={inputValues[field]}
                  onChange={(newValue) => handleInputChange(field, newValue)}
                  />
              ) : (
              <TextField
                fullWidth
                value={inputValues[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                variant="outlined"
              />
              )
              
            ) : (
            <ListItemText
              primary={fieldValues ? fieldValues[field] : ''}
              secondary={null}
              sx={{minWidth: 250}}
            />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Tooltip title={editMode[field] ? "Save" : "Edit"}>
                <IconButton
                  edge="end"
                  onClick={() => (editMode[field] ? handleSave(field) : handleEdit(field))}
                >
                  {editMode[field] ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Tooltip>

              {editMode[field] && (
                <Tooltip title="Cancel">
                  <IconButton edge="end" onClick={() => handleCancel(field)}>
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </ListItem>,
        )}
      </List>
          
    </Paper >
  );
}

export default ProfilePage;
