import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function CallToAction() {
  return (
    <Box 
      sx={{ 
        backgroundImage: 'url(/cta-background.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', 
        py: 8 
      }}>
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to play?
        </Typography>
        <Typography variant="body1" gutterBottom>
          Sign up now, create your first room and let the fun begin!
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<PersonAddIcon />}
          sx={{ mt: 3, textTransform: 'none', borderRadius: 10 }}
          component={Link}
          to="/signup"
        >
          Sign Up
        </Button>
      </Container>
    </Box>
  );
}

export default CallToAction;