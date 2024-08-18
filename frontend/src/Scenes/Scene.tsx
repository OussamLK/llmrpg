import type {Scene, CombatInput, StoryInput} from "../types"
import CombatScene from "./CombatScene"
import StoryScene from "./StoryScene"
import EventScene from "./EventScene"

export default function Scene(
    {scene, onFinish, onStoryInput, onCombatInput}
    :{scene:Scene, onFinish:()=>void, onStoryInput:(input:StoryInput)=>void, onCombatInput:(input:CombatInput)=>void}){
    let content = null 
    if (scene.type === 'story scene')
        content = <StoryScene onInput={onStoryInput} scene={scene} />
    else if (scene.type === 'combat scene')
        content = <CombatScene onInput={onCombatInput} scene={scene} /> 
    else
        content = <EventScene scene={scene} onFinish={onFinish}/>
    return <div className="scene">{content}</div>

}
