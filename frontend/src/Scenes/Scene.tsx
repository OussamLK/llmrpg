import type {Scene} from "../types"
import CombatScene from "./CombatScene"
import StoryScene from "./StoryScene"
import EventScene from "./EventScene"

export default function Scene({scene}:{scene:Scene}){
    let content = null 
    if (scene.type === 'story scene')
        content = <StoryScene scene={scene} />
    else if (scene.type === 'combat scene')
        content = <CombatScene scene={scene} /> 
    else
        content = <EventScene scene={scene}/>
    return <div className="scene">{content}</div>

}
