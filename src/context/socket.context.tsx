import { createContext, ReactNode, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext({} as Context);

interface Context {
  socket: Socket | null;
}

function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

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