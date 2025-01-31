import { createContext, useState, useEffect } from "react";
import authService from "../services/auth.service";
import { User } from "../types";
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({} as Context);

interface Context {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  storeToken: (token: string) => void;
  authenticateUser: () => void;
  logOutUser: () => void;
  googleLogin: () => void;
}

function AuthProviderWrapper(props: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const storeToken = (token: string) => {
    localStorage.setItem("authToken", token);
  };

  const authenticateUser = () => {
    // Get the stored token from the localStorage
    const storedToken = localStorage.getItem("authToken");

    // If the token exists in the localStorage
    if (storedToken) {
      authService
        .verify()
        .then((response) => {
          // If the server verifies that JWT token is valid  ✅
          const user = response.data;
          // Update state variables
          setIsLoggedIn(true);
          setIsLoading(false);
          setUser(user);
        })
        .catch((error) => {
          console.error(error);
          // If the server sends an error response (invalid token) ❌
          // Update state variables
          setIsLoggedIn(false);
          setIsLoading(false);
          setUser(null);
        });
    } else {
      // If the token is not available
      setIsLoggedIn(false);
      setIsLoading(false);
      setUser(null);
    }
  };

  const removeToken = () => {
    localStorage.removeItem("authToken");
  };

  const logOutUser = () => {
    // Upon logout, remove the token from the localStorage
    removeToken();
    authenticateUser();
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

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleAuthSuccess,
    onError: handleGoogleAuthFailure
  });

  useEffect(() => {
    // Run this code once the AuthProviderWrapper component in the App loads for the first time.
    // This effect runs when the application and the AuthProviderWrapper component load for the first time.
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        storeToken,
        authenticateUser,
        logOutUser,
        googleLogin
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthProviderWrapper, AuthContext };
