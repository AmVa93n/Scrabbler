import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import authService from "../services/auth.service";
import { SignInPage } from '@toolpad/core/SignInPage';

const providers = [
  { id: 'credentials', name: 'Email and Password' },
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
];

function SignUpLink() {
  return (
    <>
      <span>Don't have an account yet?</span>
      <Link to={"/signup"} variant="body2">
        Sign up
      </Link>
    </>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  function handleLoginSubmit(provider, formData) {
    const email = formData?.get('email');
    const password = formData?.get('password');
    const requestBody = { email, password };

    authService
      .login(requestBody)
      .then((response) => {
        // If the POST request is successful store the authentication token,
        // after the token is stored authenticate the user
        // and at last navigate to the home page
        storeToken(response.data.authToken);
        authenticateUser();
        navigate("/");
      })
      .catch((error) => {
        // If the request resolves with an error, set the error message in the state
        const errorDescription = error.response.data.message;
        alert(errorDescription);
      });
  };

  return (
    <SignInPage providers={providers} signIn={handleLoginSubmit} slots={{signUpLink: SignUpLink}}/>
  )
}

export default LoginPage;