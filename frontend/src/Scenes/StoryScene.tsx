import { useState } from "react"
import type {StoryScene, StoryInput } from "../types"
export default function StoryScene(
    {scene, onInput}
    :{scene: StoryScene, onInput:(input:StoryInput)=>void}){
        const [input, setInput]=useState("")
    return <div className='scene'>
                <p>{scene.prompt}</p>
                <label>
                    <textarea
                        placeholder="What do you do?"
                        value={input}
                        cols={50}
                        rows={5}
                        style={{fontFamily: "sans-serif", fontSize:"1em"}}
                        onChange={e=>setInput(e.currentTarget.value)}
                        />
                </label>
                <br/>
                <button
                    onClick={()=>{
                        onInput(input);
                        setInput("")
                    }}
                    style={{padding: ".3em 1em " , margin: "1em"}}
                >Enter</button>
            </div>
}