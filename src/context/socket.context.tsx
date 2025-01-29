import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from "./auth.context";

const SocketContext = createContext({} as Context);

interface Context {
  socket: Socket | null;
}

function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useContext(AuthContext); // Assume AuthContext is used to get user info

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_DEV_SERVER_URL || import.meta.env.VITE_SERVER_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    if (user) {
      newSocket.emit('online', user);
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };