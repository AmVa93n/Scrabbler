import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import appService from "../services/app.service";
import useAuth from '../hooks/useAuth';
import { GameState } from '../types';

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

        const onTurnStart = async (sessionData: GameState) => {
            if (sessionData.turnPlayer._id === user?._id) { // this is private
                setCanClick(true)
                await appService.ping()
            }
        }

        const onReject = () => {
            setCanClick(true)
        }

        const onGameEnd = () => {
            setCanClick(true)
        }
        
        socket.on('turnStarted', onTurnStart); // Listen for turn start (public)
        socket.on('moveRejected', onReject); // Listen for when a move was rejected (private)
        socket.on('gameEnded', onGameEnd); // Listen for when a game ends (public)

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnStarted', onTurnStart);
            socket.off('moveRejected', onReject);
            socket.off('gameEnded', onGameEnd);
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