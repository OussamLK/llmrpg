import { useContext } from "react"
import type { CombatRound, Enemy } from "../types"
import { gameStateContext } from "../App"
export default function CombatRound({round}:{round: CombatRound}){
    function getPlayerRange(){
        const equipedWeapon = gameState.playerStatus.equipedWeapon
        const weaponOb = gameState.inventory.weapons.find(w=>w.name === equipedWeapon)
        if (!weaponOb) return null
        if (weaponOb.details.type === 'melee') return 'close'
        else return 'far'
    }

    const gameState = useContext(gameStateContext);
    const playerAttackRange = getPlayerRange()
    console.debug("player attack", playerAttackRange)
    return (
    <div className="round">
        <h3>You are fighting {round.enemies.length} {round.enemies.length> 1? "enemies" : "enemy"}</h3>
        <ul>
            {round.enemies.map((enemy, i)=>(
                <li style={{margin:"1em"}} key={i}><Enemy details={enemy}/>&nbsp;
                {playerAttackRange && playerAttackRange === enemy.position && <button>Attack</button>}</li>)
            )}
        </ul>
        <button style={{margin:"1em"}}>Retreat</button>
        <button>Escape</button>
    </div>)
}


function Enemy({details}:{details:Enemy}){
    return <span><strong>{details.description}</strong>: health:{details.health}, {details.position}</span>
}