import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";
import useAuth from "../hooks/useAuth";

function IsPrivate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();

  // If the authentication is still loading ⏳
  if (isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    // If the user is not logged in navigate to the login page ❌
    return <Navigate to="/login" />;
  }
  // If the user is logged in, allow to see the page ✅
  return children;
}

export default IsPrivate;
