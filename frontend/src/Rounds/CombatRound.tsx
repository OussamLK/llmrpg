import { useContext, useState, useMemo } from "react"
import type { CombatRound } from "../types"
import { gameStateContext } from "../App"
import type { Enemy } from "../types"

type IDEnemy = Enemy & {id: number}

function damageEnemy(enemies:IDEnemy[], enemyId:number, damage:number):IDEnemy[]{
    return enemies.map(e=>{
        if (e.id !== enemyId) return e 
        else return {...e, health: Math.max(e.health-damage, 0)}
    })
}

export default function CombatRound({round}:{round: CombatRound}){
    const gameState = useContext(gameStateContext);
    const equipedWeapon = gameState.playerStatus.equipedWeapon
    const weaponOb = gameState.inventory.weapons.find(w=>w.name === equipedWeapon)
    function getPlayerRange(){
        if (!weaponOb) return null
        if (weaponOb.details.type === 'melee') return 'close'
        else return 'far'
    }

    const playerAttackRange = getPlayerRange()
    const [enemies, setEnemies] = useState(round.enemies.map((e, i)=>({...e,id:i })))
    const enemiesAlive = useMemo(()=>enemies.filter(enemy=>enemy.health>0), [enemies])
    console.debug("player attack", playerAttackRange)
    return (
    <div className="round">
        <h3>You are fighting {enemiesAlive.length} {enemiesAlive.length> 1? "enemies" : "enemy"}</h3>
        <ul>
            {enemiesAlive.map((enemy, i)=>(
                <li style={{margin:"1em"}} key={i}><Enemy details={enemy}/>&nbsp;
                {playerAttackRange &&
                    playerAttackRange === enemy.position &&
                    <button onClick={()=>setEnemies(damageEnemy(enemies, enemy.id, weaponOb?.damage || 0))}>Attack</button>}</li>)
            )}
        </ul>
        <button style={{margin:"1em"}}>Retreat</button>
        <button>Escape</button>
    </div>)
}


function Enemy({details}:{details:Enemy}){
    return <span><strong>{details.description}</strong>: health:{details.health}, {details.position}</span>
}