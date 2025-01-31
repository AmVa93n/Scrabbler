import { useContext } from "react"
import { AntiSpamContext } from "../context/antispam"

function useAntiSpam() {
    const context = useContext(AntiSpamContext)

    if (!context) {
        throw new Error('useAntiSpam must be used within a AntiSpamProvider')
    }

    return context
}

export default useAntiSpam