import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { Player, GameState } from '../types';

const TurnContext = createContext({} as Context);

interface Context {
    turnPlayer: Player | null;
    turnEndTime: number | null;
    turnNumber: number | null;
}

function TurnProvider(props: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const [turnPlayer, setTurnPlayer] = useState<Player | null>(null);
    const [turnEndTime, setTurnEndTime] = useState<number | null>(null);
    const [turnNumber, setTurnNumber] = useState<number | null>(null);

    useEffect(() => {
        if (!socket) return;

        const onRefresh = (sessionData: GameState) => {
            setTurnPlayer(sessionData.turnPlayer);
            setTurnEndTime(new Date(sessionData.turnEndTime).getTime());
            setTurnNumber(sessionData.turnNumber);
        }

        const onTurnStart = (sessionData: GameState) => {
            setTurnPlayer(sessionData.turnPlayer);
            setTurnEndTime(new Date(sessionData.turnEndTime).getTime()); // Convert ISO string back to a timestamp (milliseconds)
            setTurnNumber(sessionData.turnNumber);
        }

        const onTurnEnd = () => {
            setTurnPlayer(null); 
            setTurnEndTime(null); 
            setTurnNumber(null);
        }

        const onGameEnd = () => {
            setTurnPlayer(null); 
            setTurnEndTime(null); 
            setTurnNumber(null);
        }

        socket.on('refreshGame', onRefresh); // Get non-DB game data when user joins (private)
        socket.on('turnStarted', onTurnStart); // Listen for turn start (public)
        socket.on('turnEnded', onTurnEnd); // Listen for turn end (public)
        socket.on('gameEnded', onGameEnd); // Listen for when a game ends (public)

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshGame', onRefresh);
            socket.off('turnStarted', onTurnStart);
            socket.off('turnEnded', onTurnEnd);
            socket.off('gameEnded', onGameEnd);
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