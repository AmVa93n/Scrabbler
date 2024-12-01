import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import appService from "../services/app.service";
import { AuthContext } from "../context/auth.context";

const AntiSpamContext = createContext();

function AntiSpamWrapper(props) {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const [canClick, setCanClick] = useState(true);

    useEffect(() => {

        // Listen for turn start (public)
        socket.on('turnStarted', async (sessionData) => {
            if (sessionData.turnPlayer._id === User._id) { // this is private
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

    }, [socket, User._id]);

    return (
        <AntiSpamContext.Provider value={{
            canClick, setCanClick,
        }}>
            {props.children}
        </AntiSpamContext.Provider>
    );
};

export { AntiSpamWrapper, AntiSpamContext };