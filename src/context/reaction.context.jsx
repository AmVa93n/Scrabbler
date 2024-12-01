import { createContext } from 'react';

const ReactionContext = createContext();

function ReactionProvider(props) {
    const reactionTypes = ['funny', 'wholesome', 'sad', 'suspicious', 'lie', 'embarassing', 'naughty', 'confusing']
    const reactionEmojis = ['🤣','🥰','😭','🧐','🤥','😳','😏','🤔']

    return (
        <ReactionContext.Provider value={{
            reactionTypes, reactionEmojis
        }}>
            {props.children}
        </ReactionContext.Provider>
    );
};

export { ReactionProvider, ReactionContext };