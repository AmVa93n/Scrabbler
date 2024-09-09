import "./HomePage.css";
import { useSocket } from '../../context/socket.context';
import { AuthContext } from "../../context/auth.context";
import { useEffect, useContext } from 'react';

function HomePage() {
  const socket = useSocket();
  const User = useContext(AuthContext).user;

  useEffect(() => {
    if (socket && User) socket.emit('leaveRoom', `${User.name} left the room`);
  }, []);

  return (
    <div>
      <h1>Home page</h1>
    </div>
  );
}

export default HomePage;
