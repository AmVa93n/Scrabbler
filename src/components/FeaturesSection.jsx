import { Container, Typography, Grid, Box } from '@mui/material';
import FeatureIcon1 from '@mui/icons-material/Speed'; // Example icons
import FeatureIcon2 from '@mui/icons-material/Security';
import FeatureIcon3 from '@mui/icons-material/Support';

function FeaturesSection() {
  const features = [
    {
      icon: <FeatureIcon1 sx={{ fontSize: 50 }} />,
      title: 'Fast Performance',
      description: 'Optimized for speed and reliability.'
    },
    {
      icon: <FeatureIcon2 sx={{ fontSize: 50 }} />,
      title: 'Top Security',
      description: 'Your data is safe and protected with us.'
    },
    {
      icon: <FeatureIcon3 sx={{ fontSize: 50 }} />,
      title: '24/7 Support',
      description: 'We provide around-the-clock support to assist you.'
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
            Our Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
                <Box textAlign="center">
                {feature.icon}
                <Typography variant="h6" gutterBottom>
                    {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
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