import type {StoryScene } from "../types"
export default function StoryScene({scene}:{scene: StoryScene}){
    return <div className='scene'>
                <p>{scene.prompt}</p>
                <label>
                    <textarea
                        placeholder="What do you do?"
                        value={""}
                        cols={50}
                        rows={5}
                        style={{fontFamily: "sans-serif", fontSize:"1em"}}
                        />
                </label>
                <br/>
                <button style={{padding: ".3em 1em " , margin: "1em"}}>Enter</button>
            </div>
}