import { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from '../context/socket.context';
import { AuthContext } from "../context/auth.context";

const AlertContext = createContext();

function AlertProvider(props) {
    const socket = useSocket();
    const User = useContext(AuthContext).user;
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const autoClose = 2000

    useEffect(() => {

        let timer;
        // Listen for turn start (public)
        socket.on('turnStarted', async (sessionData) => {
            if (sessionData.turnPlayer._id === User._id) { // this is private
                setAlertMessage("It's your turn!");
                setIsAlertOpen(true);
            }
            timer = setTimeout(() => setIsAlertOpen(false), autoClose);
            return () => clearTimeout(timer); // Clear the timeout if the component unmounts
        });

        // Listen for turn timeout (private)
        socket.on('turnTimedOut', (hasBecomeInactive) => {
            if (!hasBecomeInactive) {
                setAlertMessage("Your turn has timed out!");
                setIsAlertOpen(true);
                timer = setTimeout(() => setIsAlertOpen(false), autoClose);
                return () => clearTimeout(timer); // Clear the timeout if the component unmounts
            }
        });

        // Listen for when a move was rejected (private)
        socket.on('moveRejected', (invalidWords) => {
            setAlertMessage(`Some of your words are not valid: ${invalidWords.join(', ')}`);
            setIsAlertOpen(true);
            timer = setTimeout(() => setIsAlertOpen(false), autoClose);
            return () => clearTimeout(timer); // Clear the timeout if the component unmounts
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnStarted');
            socket.off('turnTimedOut');
            socket.off('moveRejected');
            clearTimeout(timer);
        };

    }, [socket, User._id]);

    return (
        <AlertContext.Provider value={{
            isAlertOpen, setIsAlertOpen,
            alertMessage,
        }}>
            {props.children}
        </AlertContext.Provider>
    );
};

const BlankContext = createContext();

function BlankProvider(props) {
    const socket = useSocket();
    const [blank, setBlank] = useState(null);
    const [isLSelectOpen, setIsLSelectOpen] = useState(false);

    useEffect(() => {

        // Listen for turn timeout (private)
        socket.on('turnTimedOut', () => {
            setIsLSelectOpen(false)
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnTimedOut');
        };

    }, [socket]);

    return (
        <BlankContext.Provider value={{
            blank, setBlank,
            isLSelectOpen, setIsLSelectOpen,
        }}>
            {props.children}
        </BlankContext.Provider>
    );
};

const SwapContext = createContext();

function SwapProvider(props) {
    const socket = useSocket();
    const [isLReplaceOpen, setIsLReplaceOpen] = useState(false);

    useEffect(() => {

        // Listen for turn timeout (private)
        socket.on('turnTimedOut', () => {
            setIsLReplaceOpen(false)
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnTimedOut');
        };

    }, [socket]);

    return (
        <SwapContext.Provider value={{
            isLReplaceOpen, setIsLReplaceOpen,
        }}>
            {props.children}
        </SwapContext.Provider>
    );
};

const PromptContext = createContext();

function PromptProvider(props) {
    const socket = useSocket();
    const [promptData, setPromptData] = useState(null)
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    useEffect(() => {

        // Listen for turn timeout (private)
        socket.on('turnTimedOut', () => {
            setIsPromptOpen(false)
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnTimedOut');
        };

    }, [socket]);

    return (
        <PromptContext.Provider value={{
            promptData, setPromptData,
            isPromptOpen, setIsPromptOpen,
        }}>
            {props.children}
        </PromptContext.Provider>
    );
};

const InactiveContext = createContext();

function InactiveProvider(props) {
    const socket = useSocket();
    const [isInactiveOpen, setIsInactiveOpen] = useState(false);

    useEffect(() => {

        // Listen for turn timeout (private)
        socket.on('turnTimedOut', (hasBecomeInactive) => {
            if (hasBecomeInactive) {
                setIsInactiveOpen(true)
            }
        });

        // Clean up listeners on component unmount
        return () => {
            socket.off('turnTimedOut');
        };

    }, [socket]);

    return (
        <InactiveContext.Provider value={{
            isInactiveOpen, setIsInactiveOpen,
        }}>
            {props.children}
        </InactiveContext.Provider>
    );
};

const RulesContext = createContext();

function RulesProvider(props) {
    const [isRulesOpen, setIsRulesOpen] = useState(false)

    return (
        <RulesContext.Provider value={{
            isRulesOpen, setIsRulesOpen,
        }}>
            {props.children}
        </RulesContext.Provider>
    );
};

function ModalsWrapper({ children }) {
    return (
        <AlertProvider>
            <BlankProvider>
                <SwapProvider>
                    <PromptProvider>
                        <InactiveProvider>
                            <RulesProvider>
                                {children}
                            </RulesProvider>
                        </InactiveProvider>
                    </PromptProvider>
                </SwapProvider>
            </BlankProvider>
        </AlertProvider>
    )
}

export { ModalsWrapper, AlertContext, BlankContext, SwapContext, PromptContext, InactiveContext, RulesContext };