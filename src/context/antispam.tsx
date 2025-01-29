import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import appService from "../services/app.service";
import useAuth from '../hooks/useAuth';

const AntiSpamContext = createContext({} as Context);

interface Context {
    canClick: boolean;
    setCanClick: (value: boolean) => void;
}

function AntiSpamWrapper(props: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [canClick, setCanClick] = useState(true);

    useEffect(() => {
        if (!socket) return

        // Listen for turn start (public)
        socket.on('turnStarted', async (sessionData) => {
            if (sessionData.turnPlayer._id === user?._id) { // this is private
                setCanClick(true)
                await appService.ping()
            }
        });

        // Listen for when a move was rejected (private)
        socket.on('moveRejected', () => {
            setCanClick(true)
        });

        // Listen for when a game ends (public)
        socket.on('gameEnded', () => {
            setCanClick(true)
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnStarted');
            socket.off('moveRejected');
            socket.off('gameEnded');
        };

    }, [socket, user?._id]);

    return (
        <AntiSpamContext.Provider value={{
            canClick, setCanClick,
        }}>
            {props.children}
        </AntiSpamContext.Provider>
    );
};

export { AntiSpamWrapper, AntiSpamContext };