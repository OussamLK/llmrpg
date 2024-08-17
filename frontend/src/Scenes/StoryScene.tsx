import type {StoryScene } from "../types"
export default function StoryScene({scene}:{scene: StoryScene}){
    return <div className='scene'>
                <p>{scene.prompt}</p>
                <label><input placeholder="What do you do?" value={""} /></label>
            </div>
}