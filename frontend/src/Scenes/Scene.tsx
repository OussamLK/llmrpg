import type {Scene, PlayerInput} from "../types"
import CombatScene from "./CombatScene"
import StoryScene from "./StoryScene"
import EventScene from "./EventScene"

export default function Scene(
    {scene, onFinish, onInput}
    :{scene:Scene, onFinish:()=>void, onInput:(input:PlayerInput)=>void}){
    let content = null
    const sceneType = scene.type
    if (sceneType === 'story scene')
        content = <StoryScene onInput={onInput} scene={scene} />
    else if (sceneType === 'combat scene')
        content = <CombatScene onInput={onInput} scene={scene} /> 
    else if (sceneType === 'event' || sceneType === 'random event')
        content = <EventScene scene={scene} onFinish={onFinish}/>
    else sceneType satisfies never
    return <div className="scene">{content}</div>

}
