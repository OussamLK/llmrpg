import { useState, useEffect } from 'react'
import './App.css'
import Engine from './engine/engine'
import type { PlayerInput, FrameSequence } from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { MockLLMConnector } from './LLMConnector'

const mockLLMConnector = new MockLLMConnector()
const engine = new Engine(mockLLMConnector)
export function App() {
  const [frames, setFrames] = useState<FrameSequence | undefined>()

  useEffect(() => {
    async function setInitialFrames() { setFrames(await engine.getFrames()) }
    setInitialFrames()
  }, [])

  async function getNextFrames(input: PlayerInput) {
    engine.handleInput(input)
    setFrames(await engine.getFrames())
  }

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
  await engine.handleInput(input)
  setFrames(await engine.getFrames())
  
}

  const frame = frames?.informationFrames[0] || frames?.inputFrame //undefined while loading

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
