import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { User } from '../types';

const TurnContext = createContext({} as Context);

interface Context {
    turnPlayer: User | null;
    turnEndTime: number | null;
    turnNumber: number | null;
}

function TurnProvider(props: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const [turnPlayer, setTurnPlayer] = useState<User | null>(null);
    const [turnEndTime, setTurnEndTime] = useState<number | null>(null);
    const [turnNumber, setTurnNumber] = useState<number | null>(null);

    useEffect(() => {
        if (!socket) return;

        // Get non-DB game data when user joins (private)
        socket.on('refreshGame', (sessionData) => {
            setTurnPlayer(sessionData.turnPlayer);
            setTurnEndTime(new Date(sessionData.turnEndTime).getTime());
            setTurnNumber(sessionData.turnNumber)
        });
        
        // Listen for turn start (public)
        socket.on('turnStarted', async (sessionData) => {
            setTurnPlayer(sessionData.turnPlayer);
            setTurnEndTime(new Date(sessionData.turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
            setTurnNumber(sessionData.turnNumber)
        });

        // Listen for turn end (public)
        socket.on('turnEnded', () => {
            setTurnPlayer(null); 
            setTurnEndTime(null); 
            setTurnNumber(null);
        });

        // Listen for when a game ends (public)
        socket.on('gameEnded', () => {
            setTurnPlayer(null); 
            setTurnEndTime(null); 
            setTurnNumber(null);
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshGame');
            socket.off('turnStarted');
            socket.off('turnEnded');
            socket.off('gameEnded');
        };
        
    }, [socket]);

    return (
        <TurnContext.Provider value={{
            turnPlayer,
            turnEndTime,
            turnNumber,
        }}>
            {props.children}
        </TurnContext.Provider>
    );
};

export { TurnProvider, TurnContext };