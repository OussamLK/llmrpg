import {useState, useEffect } from 'react'
import './App.css'
import Engine, {defaultDiceRoll } from './engine/engine'
import type {Frame, InventoryInput, CombatInput, StoryInput, PlayerInput} from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { mockCombatState, mockStoryState } from './mocks/gameStates'
import { MockLLMConnector } from './LLMConnector'

const mockLLMConnector = new MockLLMConnector()
const engine = new Engine(mockLLMConnector, defaultDiceRoll)
export function App(){
  const [frames, setFrames] = useState<Frame [] | undefined>()
  
  useEffect(()=>{
  async function setInitialFrames(){setFrames(await engine.initialFrames())}
    setInitialFrames()
  }, [])

  async function getNextFrames(input:PlayerInput){
    setFrames(await engine.getNextFrames(input))
  }

  function consumeFrame(){
    if (!frames){
      console.error("trying to consume frame from undefined frames")
      throw("frames are undefined")
    }
    if (frames.length === 0)
      throw("no frame available")
    const [head, ...tail] = frames
    setFrames(tail)
    return head
  }

  return frame ? <div className="app">
      <h1>Alive health {frame.playerStatus.health}</h1>
      <div className="canvas">
      <Scene
        scene={frame.scene}
        onFinish={nextFrame}
        onCombatInput={reportInput}
        onStoryInput={reportInput}
        />
      <Inventory
        inventory={frame?.inventory}
        equipedWeapon={frame.playerStatus.equipedWeapon}
        onClick={reportInput}
      />
      </div>
      </div> : <p>loading...</p>
}


function GameOver(){
  return <p>You died!</p>
}

export default App
