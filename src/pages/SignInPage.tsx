import { useState } from 'react';
import { Avatar, Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormLabel, Link, Stack, TextField, 
  Typography } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(() => ({
  padding: 20,
  height: '100%',
}));

export default function SignInPage() {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData?.get('email');
    const password = formData?.get('password');
    const requestBody = { email, password };

    try {
      const response = await authService.login(requestBody)
      // If the POST request is successful store the authentication token,
      // after the token is stored authenticate the user
      // and at last navigate to the home page
      storeToken(response.data.authToken);
      authenticateUser();
      navigate("/");
      
    } catch (error) {
      // If the request resolves with an error, set the error message in the state
      console.error(error);
      alert("Failed to sign in");
    }
    
  };

  async function handleGoogleAuthSuccess(codeResponse: TokenResponse) {
    try {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, 
          {
            headers: {
                Authorization: `Bearer ${codeResponse.access_token}`,
                Accept: 'application/json'
            }
          })
        try {
          const response2 = await authService.google({ userData: response.data })
          storeToken(response2.data.authToken);
          authenticateUser();
          navigate('/');
      } catch (error: unknown) {
          console.error(error);
          if (axios.isAxiosError(error) && error.response) {
            alert(error.response.data.message);
          } else {
            console.error(error);
            alert('An unknown error occurred');
          }
      }
    } catch (error) {
      console.error(error);
    }
    
  };

  function handleGoogleAuthFailure() {
    console.error('Google sign-in failed');
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleAuthSuccess,
    onError: handleGoogleAuthFailure
  });

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
                sx={{ ariaLabel: 'email' }}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormLabel htmlFor="password">Password</FormLabel>
              </Box>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign in
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <span>
                <Link
                  href="/signup"
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  Sign up
                </Link>
              </span>
            </Typography>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
                variant="contained"
                startIcon={
                  <Avatar sx={{width: 32, height: 32, bgcolor: 'white'}}>
                    <img src={'/Googlelogo.svg'} alt='google' width={16} height={16}/>
                  </Avatar>}
                sx={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  textTransform: 'none',
                  bgcolor: 'rgb(237, 242, 247)',
                  color: 'black',
                  '&:hover': {
                    bgcolor: 'rgb(228, 234, 241)',
                  }
                }}
                disableElevation
                onClick={login as React.MouseEventHandler<HTMLButtonElement>}
            >
              Sign In with Google
            </Button>
          </Box>
        </Card>
      </SignInContainer>
  );
}
