import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

function HeroSection() {
  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url(/your-background-image.jpg)', // Replace with your image
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
          Welcome to Our Platform
        </Typography>
        <Typography variant="h5" gutterBottom>
          Your one-stop solution for all your needs.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3 }}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
}

export default HeroSection;