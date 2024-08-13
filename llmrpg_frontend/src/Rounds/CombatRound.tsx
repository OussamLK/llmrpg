import type { CombatRound } from "../types"
export default function CombatRound({round}:{round: CombatRound}){
    return <p className='round'>You are fighting {round.enemies.length} enemies</p>
}