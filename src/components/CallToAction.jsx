import { Box, Typography, Button, Container } from '@mui/material';

function CallToAction() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" gutterBottom>
          Sign up today and experience the best platform on the web.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 3 }}
        >
          Sign Up Now
        </Button>
      </Container>
    </Box>
  );
}

export default CallToAction;