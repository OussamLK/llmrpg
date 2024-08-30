import type { CombatInput, CombatScene } from "../types"
import type { Enemy } from "../types"



export default function CombatScene(
        {scene, onInput} :
        {scene: CombatScene, onInput:(input:CombatInput)=>void}){

    const indepedentAffordances = scene.affordances.filter(aff=>aff.type === 'independent')
    function getEnemyAffordance(enemyId:number){
        return scene.affordances.filter(aff=>aff.type === 'enemy' && aff.enemyId === enemyId)
    }
    return (
    <div className="round">
        <h3>You are fighting {scene.enemies.length} {scene.enemies.length> 1? "enemies" : "enemy"}</h3>
        <ul>
            {scene.enemies.map(enemy=>{
               const affordances = getEnemyAffordance(enemy.id)
                .map(aff=><button
                            key={aff.prompt}
                            onClick={()=>onInput({type:'combat', enemyId:enemy.id, action:aff.prompt})}
                            style={{margin: ".3em"}}>
                                {aff.prompt}
                            </button>)
               return  <li style={{margin:"1em"}} key={enemy.id}>
                    <Enemy details={enemy}/>{affordances}
                </li>
            })}
        </ul>
        {indepedentAffordances.map(aff=>(<button key={aff.prompt} onClick={()=>onInput({type:'combat', action:aff.prompt})} title={aff.description} style={{margin: ".3em"}}>{aff.prompt}</button>))}
    </div>)
}


function Enemy({details}:{details:Enemy}){
    return <span><strong>{details.description}</strong>: health:{details.health}, {details.position}</span>
}