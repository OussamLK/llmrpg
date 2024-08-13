import type { CombatRound, Enemy } from "../types"
export default function CombatRound({round}:{round: CombatRound}){
    return (
    <div className="round">
        <h3>You are fighting {round.enemies.length} {round.enemies.length> 1? "enemies" : "enemy"}</h3>
        <ul>
            {round.enemies.map((enemy, i)=>(
                <li style={{margin:"1em"}} key={i}><Enemy details={enemy}/>&nbsp;<button>Attack</button></li>)
            )}
        </ul>
        <button>Escape</button>
    </div>)
}



function Enemy({details}:{details:Enemy}){
    return <span><strong>{details.description}</strong>: health:{details.health}, {details.position}</span>
}