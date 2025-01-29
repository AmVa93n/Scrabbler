import { Box, Typography, Button, Container } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url(/hero-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2
      }}
    >
      <Container>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Scrabbler
        </Typography>
        <Typography variant="h5" gutterBottom>
          Can't get enough of Scrabble? Looking to play friends online for free? This is the place for you!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<RocketLaunchIcon />}
          sx={{ mt: 3, textTransform: 'none', borderRadius: 10 }}
          component={Link}
          to="/rooms"
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
}

export default HeroSection;