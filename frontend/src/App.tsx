import { useState, useEffect } from 'react'
import './App.css'
import Engine from './engine/engine'
import type { PlayerInput, FrameSequence } from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { MockLLMConnector } from './LLMConnector'
import { mockCombatState } from './mocks/gameStates'

const mockLLMConnector = new MockLLMConnector()
let engine : Engine | undefined
export function App() {
  const [gameOver, setGameOver] = useState(false)
  const [frames, setFrames] = useState<FrameSequence | undefined>()

  useEffect(() => {
    engine = engine || new Engine(mockLLMConnector, ()=>setGameOver(true))
    engine.getFrames()
      .then(frames=>
        {
          setFrames(frames);
          console.debug("getting initial engine frames", frames)
        })
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
    await engine.handleInput(input)
    setFrames(await engine.getFrames())
  }
  else throw("game engine is not initialized")
  
}

  const frame = frames?.informationFrames[0] || frames?.inputFrame //undefined while loading
  if (gameOver) return <GameOver/>

  return frame ? <div className="app">
    <h1>Alive health {frame.playerStatus.health}</h1>
    <div className="canvas">
      <Scene
        scene={frame.scene}
        onFinish={popInformationFrame}
        onInput={reportInput}
      />
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

export default App
