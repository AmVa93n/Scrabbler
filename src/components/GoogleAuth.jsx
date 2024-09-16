import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authService from "../services/auth.service";

function GoogleSignInButton() {
  const navigate = useNavigate();

  async function handleGoogleAuthSuccess(credentialResponse) {
    const idToken = credentialResponse.credential;
    try {
        await authService.google({ idToken })
        navigate('/');
    } catch (error) {
        const errorDescription = error.response.data.message;
        alert(errorDescription);
    }
    
  };

  function handleGoogleAuthFailure() {
    console.error('Google sign-in failed');
  };

  return (
    <GoogleLogin
        onSuccess={handleGoogleAuthSuccess}
        onError={handleGoogleAuthFailure}
        render={(renderProps) => (
            <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
            >
            Sign up with Google
            </Button>
        )}
        />
  );
}

export default GoogleSignInButton;
