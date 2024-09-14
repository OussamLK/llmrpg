import { useEffect, useRef, useState } from "react"
import type {StoryScene, StoryInput } from "../types"
export default function StoryScene(
    {scene, onInput}
    :{scene: StoryScene, onInput:(input:StoryInput)=>void}){
        const [input, setInput]=useState("")
        const ref = useRef(null);
    function onEnter(){
                        onInput(input);
                        setInput("")
    }
    useEffect(()=>{
        //@ts-ignore
        if (input==='' && ref.current) ref.current.focus()
    }, [input])
    return <div className='scene'>
                <p>{scene.prompt}</p>
                <label>
                    <textarea
                        ref={ref}
                        placeholder="What do you do?"
                        value={input}
                        cols={50}
                        rows={5}
                        style={{fontFamily: "sans-serif", fontSize:"1em"}}
                        onChange={e=>setInput(e.currentTarget.value)}
                        onKeyDown={e=>e.key === 'Enter' && onEnter()}
                        />
                </label>
                <br/>
                <button
                    onClick={onEnter}
                    style={{padding: ".3em 1em " , margin: "1em"}}
                >Enter</button>
            </div>
}