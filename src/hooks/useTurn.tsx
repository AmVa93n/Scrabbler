import { useContext } from "react"
import { TurnContext } from "../context/turn.context"

function useTurn() {
    const context = useContext(TurnContext)

    if (!context) {
        throw new Error('useTurn must be used within a TurnProvider')
    }

    return context
}

export default useTurn