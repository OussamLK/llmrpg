import { useState, useEffect } from 'react'
import './App.css'
import Engine from './engine/engine'
import type { PlayerInput, FrameSequence } from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { MockLLMConnector, LLMConnector } from './LLMConnector'

const llmConnector = new MockLLMConnector()
let engine : Engine | undefined
function App(){
  const [story, setStory] = useState<string | undefined>(undefined)
  const [keyDevelopments, setKeyDevelopments] = useState<string[] | undefined>(undefined)
  function onStart(story:string, keyDevelopments:string[]){
    setStory(story)
    setKeyDevelopments(keyDevelopments)
  }
  if (!story ||  !keyDevelopments) return <StoryEditor onStart={onStart} />
  else return <Game story={story} keyDevelopments={keyDevelopments}/>
}
export function Game({story, keyDevelopments}: {story:string, keyDevelopments:string[]}) {
  const [gameOver, setGameOver] = useState(false)
  const [frames, setFrames] = useState<FrameSequence | undefined>()
  const [fetchingFrames, setFetchingFrames] = useState(false)

  useEffect(() => {
    engine = engine || new Engine(story, keyDevelopments, llmConnector, ()=>setGameOver(true))
    engine.getFrames()
      .then(frames=>
        {
          setFrames(frames);
          console.debug("getting initial engine frames", frames)
        })
      console.log(story, keyDevelopments)
  }, [])

  function popInformationFrame() {
    if (!frames) {
      console.error("trying to consume frame from undefined frames")
      throw ("frames are undefined")
    }
    if (frames.informationFrames.length === 0)
      throw ("no frame available")
    const [head, ...tail] = frames.informationFrames
    setFrames({ informationFrames: tail, inputFrame: frames.inputFrame })
    return head
  }

async function reportInput(input:PlayerInput){
  if (engine){
    setFetchingFrames(true)
    await engine.handleInput(input)
    const frames = await engine.getFrames()
    setFrames(frames)
    setFetchingFrames(false)
  }
  else throw("game engine is not initialized")
  
}

  const frame = frames?.informationFrames[0] || frames?.inputFrame //undefined while loading
  if (gameOver) return <GameOver/>

  return frame ? <div className="app">
    <h1>Alive health {frame.playerStatus.health}</h1>
    <div className="canvas">
      {fetchingFrames? <div className="scene"><p>Thinking...</p></div> : <Scene
        scene={frame.scene}
        onFinish={popInformationFrame}
        onInput={reportInput}
      />}
      <Inventory
        inventory={frame?.inventory}
        equipedWeapon={frame.playerStatus.equipedWeapon}
        onClick={reportInput}
      />
    </div>
  </div> : <p>loading...</p>
}



function GameOver() {
  return <p>You died!</p>
}

function StoryEditor({onStart}:{onStart:(story:string, keyDevelopments:string[])=>void}){
  const [story, setStory] = useState(`You play as a survivor in a post nuclear world, wakes up in a vault and need to find a part for a water purification system`)
  const [currentDevelopmentText, setCurrentDevelopmentText] = useState(``)
  const [keyDevelopments, setKeyDevelopments] = useState([{id:0, content:`The player gets emprisoned`}, {id:1, content:`The player gets incapacitated and needs find help by an enemy deserter`}])

  return <div>
            <label>
              Describe the background of the story you want to play
              <br/>
            <textarea rows={8} cols={60} value={story} onChange={e=>setStory(e.currentTarget.value)} />
            </label>
            <br/>
            <label>
              Add a key story development
              <br/>
              <textarea
                rows={3}
                cols={60}
                value={currentDevelopmentText}
                onChange={e=>setCurrentDevelopmentText(e.currentTarget.value)} />
              <br/>
              <button onClick={()=>{
                const newID = keyDevelopments.length === 0? 0 :  Math.max(...keyDevelopments.map(d=>d.id)) + 1
                setKeyDevelopments(prev=>[...prev, {id:newID, content: currentDevelopmentText}])
                setCurrentDevelopmentText('')

              }}>Add</button>
            </label> 
            <br/>
            <div>
            <h2>Key Events</h2>
            <ul>
              {keyDevelopments.map(dev=><li key={dev.id}><span>{dev.content} <button onClick={()=>setKeyDevelopments(prev=>prev.filter(dev_=>dev_.id !== dev.id))}>delete</button></span></li>)}
            </ul>
            <br/>
            </div>
            <button
              onClick={()=>onStart(story, keyDevelopments.map(dev=>dev.content))}>Start the game</button>
        </div>
}


export default App
