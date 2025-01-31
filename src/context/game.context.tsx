import { createContext, useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { GameBoard, Tile, Player, TileOnBoard, GameState } from '../types';
import useRoom from '../hooks/useRoom';

const GameContext = createContext({} as Context);

interface Context {
    players: Player[],
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    board: GameBoard | null,
    setBoard: React.Dispatch<React.SetStateAction<GameBoard | null>>,
    rack: Tile[],
    setRack: React.Dispatch<React.SetStateAction<Tile[]>>,
    tilesPlacedThisTurn: TileOnBoard[],
    setTilesPlacedThisTurn: React.Dispatch<React.SetStateAction<TileOnBoard[]>>,
    leftInBag: number,
    resetTurnActions: () => void
}

function GameProvider(props: { children: React.ReactNode }) {
    const [players, setPlayers] = useState([] as Player[]);
    const [board, setBoard] = useState<GameBoard | null>(null);
    const [rack, setRack] = useState([] as Tile[]);
    const [tilesPlacedThisTurn, setTilesPlacedThisTurn] = useState([] as TileOnBoard[]);
    const [leftInBag, setLeftInBag] = useState(100);
    const { socket } = useSocket();
    const { setRoom } = useRoom();

    function resetTurnActions() {
        if (tilesPlacedThisTurn.length === 0) return; // nothing to reset
        setBoard(prev => {
            if (!prev) return null;
            return prev.map(row => row.map(cell => {
                const isPlacedTile = tilesPlacedThisTurn.some(tile => tile.x === cell.x && tile.y === cell.y);
                return isPlacedTile ? { ...cell, content: null, occupied: false } : cell;
            }));
        });
        setRack(prev => [...prev, ...tilesPlacedThisTurn]);
        setTilesPlacedThisTurn([]);
    }

    useEffect(() => {
        if (!socket) return;
        
        const onRefresh = (sessionData: GameState) => {
            setBoard(sessionData.board);
            setLeftInBag(sessionData.leftInBag)
            setPlayers(sessionData.players)
            setRack(sessionData.rack) 
        }
        
        const onGameUpdate = (sessionData: GameState) => {
            setBoard(sessionData.board);
            setLeftInBag(sessionData.leftInBag)
            setPlayers(sessionData.players)
        }
        
        const onRackUpdate = (rack: Tile[]) => {
            setRack(rack)
            setTilesPlacedThisTurn([])
        }

        const onGameStart = (rackSize: number, gameMode: string) => {
            setRoom(prev => prev ? ({...prev, gameSession: { settings: {rackSize, gameEnd: gameMode }}}) : null)
        }
        
        const onGameEnd = () => {
            setRoom(prev => prev ? ({...prev, gameSession: null}) : null)
            setPlayers([])
            setRack([])
            setBoard(null)
            setTilesPlacedThisTurn([])
            setLeftInBag(100)
        }

        socket.on('refreshGame', onRefresh); // Get non-DB game data when user joins (private)
        socket.on('gameUpdated', onGameUpdate); // Listen for game updates (public)
        socket.on('rackUpdated', onRackUpdate); // Listen for rack updates (private)
        socket.on('turnTimedOut', resetTurnActions); // Listen for turn timeout (private)
        socket.on('gameStarted', onGameStart); // Listen for when a new game starts (public)
        socket.on('gameEnded', onGameEnd); // Listen for when a game ends (public)

        // Clean up listeners on component unmount
        return () => {
            socket.off('refreshGame', onRefresh);
            socket.off('gameUpdated', onGameUpdate);
            socket.off('rackUpdated', onRackUpdate);
            socket.off('turnTimedOut', resetTurnActions);
            socket.off('gameStarted', onGameStart);
            socket.off('gameEnded', onGameEnd);
        };
    }, [socket, resetTurnActions]);

    return (
        <GameContext.Provider value={{
            players, setPlayers,
            board, setBoard,
            rack, setRack,
            tilesPlacedThisTurn, setTilesPlacedThisTurn,
            leftInBag,
            resetTurnActions
        }}>
            {props.children}
        </GameContext.Provider>
    );
};

export { GameProvider, GameContext };