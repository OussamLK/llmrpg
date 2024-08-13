import type {StoryRound } from "../types"
export default function StoryRound({round}:{round: StoryRound}){
    return <p className='round'>Round: {round.gamePrompt}</p>
}