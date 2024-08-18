import type {EventScene, RandomEventScene} from '../types'
import {useState} from 'react'
export default function EventScene({scene, onFinish}:{scene: EventScene, onFinish:()=>void}){
    return (
    <div className='scene'>
        {scene.type === 'random event' ? 
            <RandomEvent onFinish={onFinish} scene={scene} />
        :
            <>
                <p>Event: {scene.prompt} </p>
                <button onClick={onFinish}>Next</button>
            </>}
    </div>)
}


export function RandomEvent({scene, onFinish}:{scene:RandomEventScene, onFinish:()=>void}){
    type RollState = 'prompt' | 'rolling' | 'rolled'
    const [lifeCycle, setLifeCycle] = useState<RollState>('prompt')
    function delayedRoll(){
        setLifeCycle('rolling')
        setTimeout(()=>setLifeCycle('rolled'), 500)
    }

    if (lifeCycle === 'prompt')
    {
        return (
        <div>
            <p>{scene.prompt}, difficulty : {100-scene.probability}</p>
            <p> rolling the dice...</p>
            <button onClick={()=>delayedRoll()}>Roll</button>
        </div>)
    }
    else if (lifeCycle === 'rolling'){
        return <p>Rolling...</p>
    }
    {
        return <>
            <p>Result </p>
            <p style={{fontSize:"1.2em"}}><strong>{scene.diceOutcome}</strong>: {scene.outcomeMessage}</p>
            <button onClick={onFinish}>Next</button>
            </>
    }


}