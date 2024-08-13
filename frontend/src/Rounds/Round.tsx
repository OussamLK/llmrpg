import type {Round} from '../types'
import CombatRound from './CombatRound'
import StoryRound from './StoryRound'
export default function Round({round}:{round:Round}){
    if (round.details.type === 'story round')
        return <StoryRound round={round.details} />
    else return <CombatRound round={round.details} /> 

}