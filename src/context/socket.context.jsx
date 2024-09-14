import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from "./auth.context";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext); // Assume AuthContext is used to get user info

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_DEV_SERVER_URL || process.env.REACT_APP_SERVER_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    if (user) {
      newSocket.emit('online', user);
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
