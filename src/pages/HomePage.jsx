import { AuthContext } from "../context/auth.context";
import { useContext } from 'react';

function HomePage() {
  const User = useContext(AuthContext).user;

  return (
    <div>
      <h1>Home page</h1>
    </div>
  );
}

export default HomePage;
