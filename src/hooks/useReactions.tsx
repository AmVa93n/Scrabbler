function useReactions() {
    const reactionTypes = ['funny', 'wholesome', 'sad', 'suspicious', 'lie', 'embarassing', 'naughty', 'confusing']
    const reactionEmojis = ['🤣','🥰','😭','🧐','🤥','😳','😏','🤔']

    return { reactionTypes, reactionEmojis }
}

export default useReactions;