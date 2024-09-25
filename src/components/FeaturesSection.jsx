import { Container, Typography, Grid, Box } from '@mui/material';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import TuneIcon from '@mui/icons-material/Tune';

function FeaturesSection() {
  const features = [
    {
      icon: <CreditCardOffIcon sx={{ fontSize: 50 }} />,
      title: 'Unlimited Fun',
      description: 'Our service is free and always will be. No credit cards, no ads. Any number of games can be played daily, including simultanously, with no limits on the number of players.'
    },
    {
      icon: <Diversity3Icon sx={{ fontSize: 50 }} />,
      title: 'Space for Everyone',
      description: 'Create unlimited number of private fully manageable rooms with live chat for your friends, family or coworkers, so everyone can enjoy Scrabble the way they prefer.'
    },
    {
      icon: <TuneIcon sx={{ fontSize: 50 }} />,
      title: 'Customizable',
      description: `If you're tired of Classic Scrabble, shake things up and change the settings to your liking. Make the game truly yours with our Board and Tile Bag Editors and share your creations.`
    }
  ];

  return (
    <Box 
      sx={{ 
        backgroundImage: 'url(/features-background.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', 
        py: 8, 
      }}>
        <Container>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
            Why Scrabbler?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
                <Box textAlign="center">
                {feature.icon}
                <Typography variant="h6" gutterBottom>
                    {feature.title}
                </Typography>
                <Typography variant="body1">
                    {feature.description}
                </Typography>
                </Box>
            </Grid>
            ))}
        </Grid>
        </Container>
    </Box>
  );
}

export default FeaturesSection;