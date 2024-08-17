import type {Scene} from "../types"
import CombatScene from "./CombatScene"

export default function Scene({scene}:{scene:Scene}){
    let content = null 
    if (scene.type === 'story scene')
        content = <p>Story scene</p>
    else if (scene.type === 'combat scene')
        content = <CombatScene scene={scene} /> 
    else
        content = <p>Event {scene.prompt}</p>
    return <div className="scene">{content}</div>

}
